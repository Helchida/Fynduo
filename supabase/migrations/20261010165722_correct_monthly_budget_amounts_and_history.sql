-- Budgets use the same euro convention as charges and revenues. The first
-- version stored integers in cents; convert exactly once while preserving rows.
alter table public.budgets rename column initial_amount_cents to initial_amount;
alter table public.budgets alter column initial_amount type numeric(12,2)
  using round(initial_amount::numeric / 100, 2);

alter table public.budget_period_snapshots rename column initial_amount_cents to initial_amount;
alter table public.budget_period_snapshots alter column initial_amount type numeric(12,2)
  using round(initial_amount::numeric / 100, 2);
alter table public.budget_period_snapshots
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists spent_amount numeric(12,2),
  add column if not exists remaining_amount numeric(12,2),
  add column if not exists closed_at timestamptz;

-- Old snapshots only retained configuration. Preserve that data and expose
-- their period bounds, but deliberately leave spending NULL: it was not
-- recorded at closure and cannot be reconstructed faithfully after edits.
update public.budget_period_snapshots snapshot
set period_start = period.start_date,
    period_end = period.end_date,
    closed_at = case when period.end_date is null then null else period.end_date::timestamptz end
from public.financial_periods period
where snapshot.period_key = 'pay:' || period.id
  and snapshot.period_start is null;

create index if not exists budget_period_snapshots_household_closed_idx
  on public.budget_period_snapshots (household_id, closed_at desc);

-- The personal Budget configuration may only ever belong to the user's solo
-- household. Firebase identity is checked by the Edge Function and asserted
-- again here because SECURITY DEFINER bypasses RLS.
drop function if exists public.save_budget(text, text, text, text, integer, text[], text);
create function public.save_budget(
  p_author_id text,
  p_budget_id text,
  p_household_id text,
  p_name text,
  p_initial_amount numeric,
  p_category_ids text[],
  p_period_key text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_household_id is distinct from p_author_id then
    raise exception 'budgets_require_solo_household' using errcode = '42501';
  end if;
  if not exists (select 1 from public.households where id = p_household_id and p_author_id = any(members)) then
    raise exception 'forbidden_household_membership' using errcode = '42501';
  end if;
  if p_budget_id is null or char_length(trim(p_budget_id)) = 0 then raise exception 'budget_id_required' using errcode = '22023'; end if;
  if p_period_key is null or char_length(trim(p_period_key)) = 0 then raise exception 'budget_period_required' using errcode = '22023'; end if;
  if p_name is null or char_length(trim(p_name)) = 0 then raise exception 'budget_name_required' using errcode = '22023'; end if;
  if p_initial_amount is null or p_initial_amount < 0 or p_initial_amount > 9999999999.99 then raise exception 'invalid_budget_amount' using errcode = '22023'; end if;
  if p_category_ids is null or cardinality(p_category_ids) = 0 then raise exception 'budget_categories_required' using errcode = '22023'; end if;
  if cardinality(p_category_ids) <> cardinality(array(select distinct unnest(p_category_ids))) then raise exception 'duplicate_budget_categories' using errcode = '22023'; end if;
  if exists (select 1 from unnest(p_category_ids) category_id where not exists (
    select 1 from public.categories category where category.id = p_household_id || '_' || category_id
  )) then raise exception 'budget_category_not_in_household' using errcode = '22023'; end if;

  insert into public.budgets (id, household_id, name, initial_amount)
  values (p_budget_id, p_household_id, trim(p_name), round(p_initial_amount, 2))
  on conflict (id) do update set name = excluded.name, initial_amount = excluded.initial_amount, updated_at = now()
  where budgets.household_id = p_household_id;
  if not found then raise exception 'budget_not_found_or_forbidden' using errcode = '42501'; end if;

  delete from public.budget_categories where budget_id = p_budget_id;
  insert into public.budget_categories (budget_id, household_id, category_id)
  select p_budget_id, p_household_id, category_id from unnest(p_category_ids) category_id;
end;
$$;

drop function if exists public.delete_budget(text, text, text);
create function public.delete_budget(
  p_author_id text,
  p_household_id text,
  p_budget_id text,
  p_period_key text
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_initial_amount numeric(12,2);
  v_categories jsonb;
  v_period_id text;
  v_period_start date;
begin
  if p_household_id is distinct from p_author_id then raise exception 'budgets_require_solo_household' using errcode = '42501'; end if;
  if not exists (select 1 from public.households where id = p_household_id and p_author_id = any(members)) then
    raise exception 'forbidden_household_membership' using errcode = '42501';
  end if;
  select name, initial_amount into v_name, v_initial_amount from public.budgets
  where id = p_budget_id and household_id = p_household_id;
  if not found then raise exception 'budget_not_found_or_forbidden' using errcode = '42501'; end if;
  select jsonb_agg(category_id order by category_id) into v_categories from public.budget_categories where budget_id = p_budget_id;

  if p_period_key like 'pay:%' then
    v_period_id := substring(p_period_key from 5);
    select start_date into v_period_start from public.financial_periods
    where id = v_period_id and user_id = p_author_id and end_date is null;
    if v_period_start is null then raise exception 'budget_period_not_active' using errcode = '22023'; end if;
    insert into public.budget_period_snapshots (household_id, budget_id, period_key, period_start, name, initial_amount, category_ids)
    values (p_household_id, p_budget_id, p_period_key, v_period_start, v_name, v_initial_amount, coalesce(v_categories, '[]'::jsonb))
    on conflict (budget_id, period_key) do nothing;
  end if;

  delete from public.budgets where id = p_budget_id and household_id = p_household_id;
end;
$$;

-- Capture immutable period-end values before a reference pay opens a new one.
-- Existing historical rows remain distinguishable by their NULL amounts.
create or replace function public.close_budget_period_snapshot()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_period_key text := 'pay:' || old.id;
begin
  if old.period_type <> 'PAY_PERIOD' or old.end_date is not null or new.end_date is null then return new; end if;

  with active_configs as (
    select budget.id as budget_id, budget.household_id, budget.name, budget.initial_amount,
      coalesce(jsonb_agg(category.category_id order by category.category_id), '[]'::jsonb) as category_ids
    from public.budgets budget
    left join public.budget_categories category on category.budget_id = budget.id
    where budget.household_id = old.user_id
    group by budget.id, budget.household_id, budget.name, budget.initial_amount
  ), deleted_configs as (
    select snapshot.budget_id, snapshot.household_id, snapshot.name, snapshot.initial_amount, snapshot.category_ids
    from public.budget_period_snapshots snapshot
    where snapshot.household_id = old.user_id and snapshot.period_key = v_period_key and snapshot.closed_at is null
      and not exists (select 1 from public.budgets budget where budget.id = snapshot.budget_id)
  ), configs as (
    select * from active_configs union all select * from deleted_configs
  ), values_at_close as (
    select config.*, coalesce((
      select round(sum(case
        when charge.repartition ? old.user_id then (charge.repartition ->> old.user_id)::numeric
        else charge.montant_total / greatest(cardinality(charge.beneficiaires), 1)
      end), 2)
      from public.charges charge
      where charge.nature = 'depense'
        and charge.beneficiaires @> array[old.user_id]
        and charge.categorie in (select jsonb_array_elements_text(config.category_ids))
        and charge.date_statistiques::date between old.start_date and new.end_date
    ), 0::numeric) as spent_amount
    from configs config
  )
  insert into public.budget_period_snapshots (
    household_id, budget_id, period_key, period_start, period_end, name,
    initial_amount, spent_amount, remaining_amount, category_ids, closed_at
  )
  select household_id, budget_id, v_period_key, old.start_date, new.end_date, name,
    initial_amount, spent_amount, round(initial_amount - spent_amount, 2), category_ids, now()
  from values_at_close
  on conflict (budget_id, period_key) do update set
    period_start = excluded.period_start, period_end = excluded.period_end,
    name = excluded.name, initial_amount = excluded.initial_amount,
    spent_amount = excluded.spent_amount, remaining_amount = excluded.remaining_amount,
    category_ids = excluded.category_ids, closed_at = excluded.closed_at, updated_at = now()
  where public.budget_period_snapshots.closed_at is null;
  return new;
end;
$$;

drop trigger if exists financial_periods_close_budget_snapshot on public.financial_periods;
create trigger financial_periods_close_budget_snapshot
after update of end_date on public.financial_periods
for each row execute function public.close_budget_period_snapshot();

revoke all on function public.save_budget(text, text, text, text, numeric, text[], text) from public, anon, authenticated;
revoke all on function public.delete_budget(text, text, text, text) from public, anon, authenticated;
revoke all on function public.close_budget_period_snapshot() from public, anon, authenticated;
grant execute on function public.save_budget(text, text, text, text, numeric, text[], text) to service_role;
grant execute on function public.delete_budget(text, text, text, text) to service_role;

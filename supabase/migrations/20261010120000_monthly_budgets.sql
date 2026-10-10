-- Budgets are managed only through the Firebase-authenticated Edge Function.
-- No browser policy is granted because this application does not create a
-- Supabase Auth session.
create table if not exists public.budgets (
  id text primary key,
  household_id text not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  initial_amount_cents integer not null check (initial_amount_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budget_categories (
  budget_id text not null references public.budgets(id) on delete cascade,
  household_id text not null references public.households(id) on delete cascade,
  category_id text not null,
  created_at timestamptz not null default now(),
  primary key (budget_id, category_id),
  -- A category can contribute to only one current budget in a household.
  unique (household_id, category_id)
);

-- Snapshots are retained after a budget is deleted and are written whenever a
-- configuration is created or changed during a period. They make closed
-- period results immune to later configuration changes without copying charges.
create table if not exists public.budget_period_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id text not null references public.households(id) on delete cascade,
  budget_id text not null,
  period_key text not null,
  name text not null,
  initial_amount_cents integer not null check (initial_amount_cents >= 0),
  category_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_id, period_key)
);

create index if not exists budgets_household_updated_idx on public.budgets (household_id, updated_at desc);
create index if not exists budget_categories_household_idx on public.budget_categories (household_id, category_id);
create index if not exists budget_period_snapshots_household_period_idx on public.budget_period_snapshots (household_id, period_key);

alter table public.budgets enable row level security;
alter table public.budget_categories enable row level security;
alter table public.budget_period_snapshots enable row level security;
revoke all on public.budgets, public.budget_categories, public.budget_period_snapshots from anon, authenticated;

create or replace function public.save_budget(
  p_author_id text,
  p_budget_id text,
  p_household_id text,
  p_name text,
  p_initial_amount_cents integer,
  p_category_ids text[],
  p_period_key text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_category_ids jsonb;
begin
  if not exists (
    select 1 from public.households
    where id = p_household_id and p_author_id = any(members)
  ) then raise exception 'forbidden household membership' using errcode = '42501'; end if;
  if p_budget_id is null or char_length(trim(p_budget_id)) = 0 then raise exception 'budget_id_required' using errcode = '22023'; end if;
  if p_period_key is null or char_length(trim(p_period_key)) = 0 then raise exception 'budget_period_required' using errcode = '22023'; end if;
  if p_name is null or char_length(trim(p_name)) = 0 then raise exception 'budget_name_required' using errcode = '22023'; end if;
  if p_initial_amount_cents is null or p_initial_amount_cents < 0 then raise exception 'invalid_budget_amount' using errcode = '22023'; end if;
  if p_category_ids is null or cardinality(p_category_ids) = 0 then raise exception 'budget_categories_required' using errcode = '22023'; end if;
  if cardinality(p_category_ids) <> cardinality(array(select distinct unnest(p_category_ids))) then raise exception 'duplicate_budget_categories' using errcode = '22023'; end if;
  if exists (
    select 1 from unnest(p_category_ids) category_id
    where not exists (select 1 from public.categories c where c.id = p_household_id || '_' || category_id)
  ) then raise exception 'budget_category_not_in_household' using errcode = '22023'; end if;

  insert into public.budgets (id, household_id, name, initial_amount_cents)
  values (p_budget_id, p_household_id, trim(p_name), p_initial_amount_cents)
  on conflict (id) do update set name = excluded.name, initial_amount_cents = excluded.initial_amount_cents, updated_at = now()
  where budgets.household_id = p_household_id;
  if not found then raise exception 'budget_not_found_or_forbidden' using errcode = '42501'; end if;

  delete from public.budget_categories where budget_id = p_budget_id;
  insert into public.budget_categories (budget_id, household_id, category_id)
  select p_budget_id, p_household_id, category_id from unnest(p_category_ids) category_id;

  select jsonb_agg(category_id order by category_id) into v_category_ids from unnest(p_category_ids) category_id;
  insert into public.budget_period_snapshots (household_id, budget_id, period_key, name, initial_amount_cents, category_ids)
  values (p_household_id, p_budget_id, p_period_key, trim(p_name), p_initial_amount_cents, v_category_ids)
  on conflict (budget_id, period_key) do update set name = excluded.name, initial_amount_cents = excluded.initial_amount_cents,
    category_ids = excluded.category_ids, updated_at = now();
end;
$$;

create or replace function public.delete_budget(p_author_id text, p_household_id text, p_budget_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.households where id = p_household_id and p_author_id = any(members)) then
    raise exception 'forbidden household membership' using errcode = '42501';
  end if;
  delete from public.budgets where id = p_budget_id and household_id = p_household_id;
  if not found then raise exception 'budget_not_found_or_forbidden' using errcode = '42501'; end if;
end;
$$;

revoke all on function public.save_budget(text, text, text, text, integer, text[], text) from public, anon, authenticated;
revoke all on function public.delete_budget(text, text, text) from public, anon, authenticated;
grant execute on function public.save_budget(text, text, text, text, integer, text[], text) to service_role;
grant execute on function public.delete_budget(text, text, text) to service_role;

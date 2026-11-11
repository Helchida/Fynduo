-- Nettoyage des snapshots non clôturés correspondant
-- à des budgets qui n'existent plus.
--
-- Les historiques déjà clôturés sont conservés.
delete from public.budget_period_snapshots snapshot
where snapshot.closed_at is null
  and not exists (
    select 1
    from public.budgets budget
    where budget.id = snapshot.budget_id
      and budget.household_id = snapshot.household_id
  );

-- Suppression d'un budget sans création d'un snapshot historique.
create or replace function public.delete_budget(
  p_author_id text,
  p_household_id text,
  p_budget_id text,
  p_period_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Vérification du foyer solo.
  if p_household_id is distinct from p_author_id then
    raise exception 'budgets_require_solo_household'
    using errcode = '42501';
  end if;

  -- Vérification de l'appartenance au foyer.
  if not exists (
    select 1
    from public.households
    where id = p_household_id
      and p_author_id = any(members)
  ) then
    raise exception 'forbidden_household_membership'
    using errcode = '42501';
  end if;

  -- Vérification de l'existence du budget.
  if not exists (
    select 1
    from public.budgets
    where id = p_budget_id
      and household_id = p_household_id
  ) then
    raise exception 'budget_not_found_or_forbidden'
    using errcode = '42501';
  end if;

  -- Nettoyage d'un éventuel snapshot non clôturé.
  -- On conserve impérativement les snapshots historiques clôturés.
  delete from public.budget_period_snapshots
  where budget_id = p_budget_id
    and household_id = p_household_id
    and period_key = p_period_key
    and closed_at is null;

  -- Suppression effective du budget.
  delete from public.budgets
  where id = p_budget_id
    and household_id = p_household_id;
end;
$$;

-- Enregistrement de l'historique uniquement pour les budgets
-- encore existants au moment de la clôture de la période.
create or replace function public.close_budget_period_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period_key text := 'pay:' || old.id;
begin
  if old.period_type <> 'PAY_PERIOD'
     or old.end_date is not null
     or new.end_date is null then
    return new;
  end if;

  with active_configs as (
    select
      budget.id as budget_id,
      budget.household_id,
      budget.name,
      budget.initial_amount,
      coalesce(
        jsonb_agg(category.category_id order by category.category_id),
        '[]'::jsonb
      ) as category_ids
    from public.budgets budget
    left join public.budget_categories category
      on category.budget_id = budget.id
    where budget.household_id = old.user_id
    group by
      budget.id,
      budget.household_id,
      budget.name,
      budget.initial_amount
  ),
  values_at_close as (
    select
      config.*,
      coalesce((
        select round(
          sum(
            case
              when charge.repartition ? old.user_id then
                (charge.repartition ->> old.user_id)::numeric
              else
                charge.montant_total /
                greatest(cardinality(charge.beneficiaires), 1)
            end
          ),
          2
        )
        from public.charges charge
        where charge.nature = 'depense'
          and charge.beneficiaires @> array[old.user_id]
          and charge.categorie in (
            select jsonb_array_elements_text(config.category_ids)
          )
          and charge.date_statistiques::date
              between old.start_date and new.end_date
      ), 0::numeric) as spent_amount
    from active_configs config
  )

  insert into public.budget_period_snapshots (
    household_id,
    budget_id,
    period_key,
    period_start,
    period_end,
    name,
    initial_amount,
    spent_amount,
    remaining_amount,
    category_ids,
    closed_at
  )
  select
    household_id,
    budget_id,
    v_period_key,
    old.start_date,
    new.end_date,
    name,
    initial_amount,
    spent_amount,
    round(initial_amount - spent_amount, 2),
    category_ids,
    now()
  from values_at_close

  on conflict (budget_id, period_key)
  do update set
    period_start = excluded.period_start,
    period_end = excluded.period_end,
    name = excluded.name,
    initial_amount = excluded.initial_amount,
    spent_amount = excluded.spent_amount,
    remaining_amount = excluded.remaining_amount,
    category_ids = excluded.category_ids,
    closed_at = excluded.closed_at,
    updated_at = now()
  where public.budget_period_snapshots.closed_at is null;

  return new;
end;
$$;



-- Conservation des permissions existantes.
revoke all on function public.delete_budget(text, text, text, text)
from public, anon, authenticated;

revoke all on function public.close_budget_period_snapshot()
from public, anon, authenticated;

grant execute on function public.delete_budget(text, text, text, text)
to service_role;
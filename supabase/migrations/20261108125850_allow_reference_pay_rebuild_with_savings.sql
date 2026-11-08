-- Rebuilding reference-pay boundaries must preserve existing savings movements.
-- The rebuild runs atomically and reassigns movements to their new containing
-- period. A period predating the first reference pay is retained when needed
-- for movements that would otherwise have no valid PAY_PERIOD.
create or replace function public.prevent_financial_ledger_mutation()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_table_name = 'epargne_mouvements'
     and old.financial_period_id is not null
     and new.financial_period_id is distinct from old.financial_period_id
     and current_setting('fynduo.rebuilding_pay_periods', true) is distinct from 'on' then
    raise exception 'savings_movement_period_is_immutable';
  end if;
  return new;
end;
$$;

create or replace function public.rebuild_pay_periods_from_reference_revenus(p_user_id text)
returns void language plpgsql set search_path = public as $$
declare
  v_reference record;
  v_previous_id text;
  v_previous_start date;
  v_period_id text;
  v_first_start date;
  v_first_movement date;
  v_old_period_start date;
  v_fallback_start date;
begin
  perform set_config('fynduo.rebuilding_pay_periods', 'on', true);

  select min(em.date_mouvement), min(fp.start_date)
  into v_first_movement, v_old_period_start
  from public.epargne_mouvements em
  join public.financial_periods fp on fp.id = em.financial_period_id
  where fp.user_id = p_user_id and fp.period_type = 'PAY_PERIOD';

  -- The movement records themselves remain unchanged. Only their persisted
  -- period relation is temporarily cleared inside this transaction.
  update public.epargne_mouvements em
  set financial_period_id = null
  from public.financial_periods fp
  where fp.id = em.financial_period_id
    and fp.user_id = p_user_id
    and fp.period_type = 'PAY_PERIOD';

  update public.revenus set financial_period_id = null where household_id = p_user_id;
  update public.charges set financial_period_id = null where household_id = p_user_id;
  delete from public.financial_periods
  where user_id = p_user_id and period_type = 'PAY_PERIOD';

  -- A movement preceding the first current reference pay needs a valid
  -- historical PAY_PERIOD even after a reference pay is disabled or moved.
  select min(date_reception::date) into v_first_start
  from public.revenus
  where household_id = p_user_id and is_reference_pay = true;

  if v_first_movement is not null
     and (v_first_start is null or v_first_movement < v_first_start) then
    v_fallback_start := least(coalesce(v_old_period_start, v_first_movement), v_first_movement);
    insert into public.financial_periods (user_id, period_type, start_date)
    values (p_user_id, 'PAY_PERIOD', v_fallback_start)
    returning id into v_previous_id;
    v_previous_start := v_fallback_start;
    v_first_start := v_fallback_start;
  end if;

  for v_reference in
    select id, date_reception::date as pay_date
    from public.revenus
    where household_id = p_user_id and is_reference_pay = true
    order by date_reception::date, id
  loop
    if v_previous_start is not null and v_reference.pay_date <= v_previous_start then
      raise exception 'reference_pay_dates_must_be_unique_and_after_prior_period';
    end if;
    if v_previous_id is not null then
      update public.financial_periods
      set end_date = v_reference.pay_date - 1
      where id = v_previous_id;
    end if;
    insert into public.financial_periods (user_id, period_type, start_date, reference_revenu_id)
    values (p_user_id, 'PAY_PERIOD', v_reference.pay_date, v_reference.id)
    returning id into v_period_id;
    v_previous_id := v_period_id;
    v_previous_start := v_reference.pay_date;
    v_first_start := coalesce(v_first_start, v_reference.pay_date);
  end loop;

  if v_first_start is null then
    delete from public.savings_period_settings where user_id = p_user_id;
  else
    insert into public.savings_period_settings (user_id, first_reference_pay_date)
    values (p_user_id, v_first_start)
    on conflict (user_id) do update set first_reference_pay_date = excluded.first_reference_pay_date;
  end if;

  update public.epargne_mouvements em
  set financial_period_id = fp.id
  from public.financial_periods fp
  where em.user_id = p_user_id
    and em.financial_period_id is null
    and fp.user_id = p_user_id
    and fp.period_type = 'PAY_PERIOD'
    and em.date_mouvement >= fp.start_date
    and (fp.end_date is null or em.date_mouvement <= fp.end_date);

  if exists (
    select 1 from public.epargne_mouvements
    where user_id = p_user_id and financial_period_id is null
  ) then
    raise exception 'savings_movement_cannot_be_assigned_to_rebuilt_pay_period';
  end if;

  update public.revenus r
  set financial_period_id = fp.id
  from public.financial_periods fp
  where r.household_id = p_user_id and fp.user_id = p_user_id
    and fp.period_type = 'PAY_PERIOD'
    and r.date_reception::date >= fp.start_date
    and (fp.end_date is null or r.date_reception::date <= fp.end_date);

  update public.charges c
  set financial_period_id = fp.id
  from public.financial_periods fp
  where c.household_id = p_user_id and fp.user_id = p_user_id
    and fp.period_type = 'PAY_PERIOD'
    and c.date_statistiques::date >= fp.start_date
    and (fp.end_date is null or c.date_statistiques::date <= fp.end_date);
end;
$$;

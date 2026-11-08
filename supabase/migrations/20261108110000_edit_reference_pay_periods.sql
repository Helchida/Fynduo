-- Reference-pay status is editable. Rebuild the mutable pay-period schedule
-- from its reference revenues, while refusing to rewrite a savings ledger.
create or replace function public.rebuild_pay_periods_from_reference_revenus(p_user_id text)
returns void language plpgsql set search_path = public as $$
declare
  v_reference record;
  v_previous_id text;
  v_previous_start date;
  v_period_id text;
  v_first_start date;
begin
  if exists (
    select 1
    from public.epargne_mouvements em
    join public.financial_periods fp on fp.id = em.financial_period_id
    where fp.user_id = p_user_id and fp.period_type = 'PAY_PERIOD'
  ) then
    raise exception 'reference_pay_boundary_with_savings_movements_cannot_be_changed';
  end if;

  -- Detach ordinary records before replacing their derived period links.
  update public.revenus set financial_period_id = null where household_id = p_user_id;
  update public.charges set financial_period_id = null where household_id = p_user_id;
  delete from public.financial_periods
  where user_id = p_user_id and period_type = 'PAY_PERIOD';

  for v_reference in
    select id, date_reception::date as pay_date
    from public.revenus
    where household_id = p_user_id and is_reference_pay = true
    order by date_reception::date, id
  loop
    if v_previous_start is not null and v_reference.pay_date = v_previous_start then
      raise exception 'reference_pay_dates_must_be_unique';
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
    return;
  end if;

  insert into public.savings_period_settings (user_id, first_reference_pay_date)
  values (p_user_id, v_first_start)
  on conflict (user_id) do update set first_reference_pay_date = excluded.first_reference_pay_date;

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

create or replace function public.prevent_financial_ledger_mutation()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_table_name = 'epargne_mouvements' and old.financial_period_id is not null
     and new.financial_period_id is distinct from old.financial_period_id then
    raise exception 'savings_movement_period_is_immutable';
  end if;
  return new;
end;
$$;

create or replace function public.sync_reference_pay_periods()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.is_reference_pay and new.household_id is distinct from new.beneficiaire then
    raise exception 'reference_pay_must_belong_to_solo_household';
  end if;
  perform public.rebuild_pay_periods_from_reference_revenus(new.household_id);
  return new;
end;
$$;

drop trigger if exists revenus_sync_reference_pay_periods on public.revenus;
create trigger revenus_sync_reference_pay_periods
after update of is_reference_pay, date_reception on public.revenus
for each row
when (old.is_reference_pay is distinct from new.is_reference_pay
      or (new.is_reference_pay and old.date_reception is distinct from new.date_reception))
execute function public.sync_reference_pay_periods();

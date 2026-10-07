-- Existing data remains untouched.  These rules only classify future writes.
alter table public.savings_period_settings
  drop constraint if exists savings_period_settings_first_pay_not_future;

create or replace function public.create_pay_period_from_reference_revenu()
returns trigger language plpgsql set search_path = public as $$
declare
  v_pay_date date := new.date_reception::date;
  v_anchor date;
  v_previous_start date;
  v_period_id text;
begin
  if not new.is_reference_pay then
    select fp.id into new.financial_period_id
    from public.financial_periods fp
    join public.savings_period_settings s on s.user_id = fp.user_id
    where fp.user_id = new.household_id and fp.period_type = 'PAY_PERIOD'
      and new.date_reception::date >= s.first_reference_pay_date
      and new.date_reception::date >= fp.start_date
      and (fp.end_date is null or new.date_reception::date <= fp.end_date)
    order by fp.start_date desc limit 1;
    return new;
  end if;
  if new.household_id is distinct from new.beneficiaire then raise exception 'reference_pay_must_belong_to_solo_household'; end if;
  select first_reference_pay_date into v_anchor from savings_period_settings where user_id = new.household_id;
  if v_anchor is null then insert into savings_period_settings (user_id, first_reference_pay_date) values (new.household_id, v_pay_date); v_anchor := v_pay_date; end if;
  if v_pay_date < v_anchor then raise exception 'reference_pay_before_initial_anchor'; end if;
  select max(start_date) into v_previous_start from financial_periods where user_id = new.household_id and period_type = 'PAY_PERIOD';
  if v_previous_start is not null and v_pay_date <= v_previous_start then raise exception 'reference_pay_dates_must_be_added_in_chronological_order'; end if;
  update financial_periods set end_date = v_pay_date - 1 where user_id = new.household_id and period_type = 'PAY_PERIOD' and end_date is null;
  insert into financial_periods (user_id, period_type, start_date, reference_revenu_id) values (new.household_id, 'PAY_PERIOD', v_pay_date, new.id) returning id into v_period_id;
  new.financial_period_id := v_period_id;
  return new;
end;
$$;

create or replace function public.validate_savings_movement_period()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists (select 1 from public.financial_periods fp where fp.id = new.financial_period_id and fp.user_id = new.user_id and fp.period_type = 'PAY_PERIOD' and new.date_mouvement >= fp.start_date and (fp.end_date is null or new.date_mouvement <= fp.end_date)) then
    raise exception 'savings_movement_must_reference_its_owner_pay_period';
  end if;
  return new;
end;
$$;
drop trigger if exists epargne_mouvements_validate_period on public.epargne_mouvements;
create trigger epargne_mouvements_validate_period before insert on public.epargne_mouvements for each row execute function public.validate_savings_movement_period();

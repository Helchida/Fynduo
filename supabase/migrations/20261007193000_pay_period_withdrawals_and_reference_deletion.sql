-- Future withdrawals are dated and assigned at the instant they are created.
-- This keeps an active pay-period ledger without rewriting legacy movements.
create or replace function public.assign_savings_movement_period()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.financial_period_id is null then
    select fp.id into new.financial_period_id
    from public.financial_periods fp
    join public.savings_period_settings s on s.user_id = fp.user_id
    where fp.user_id = new.user_id and fp.period_type = 'PAY_PERIOD'
      and new.date_mouvement >= s.first_reference_pay_date
      and new.date_mouvement >= fp.start_date
      and (fp.end_date is null or new.date_mouvement <= fp.end_date)
    order by fp.start_date desc limit 1;
  end if;
  if new.financial_period_id is null then
    raise exception 'savings_movement_requires_an_active_pay_period';
  end if;
  return new;
end;
$$;

drop trigger if exists epargne_mouvements_assign_period on public.epargne_mouvements;
create trigger epargne_mouvements_assign_period
before insert on public.epargne_mouvements
for each row execute function public.assign_savings_movement_period();

-- A reference income may be deleted only when its period has no savings
-- movements. This preserves the immutable savings ledger; ordinary revenues
-- and charges are safely moved to the preceding surviving period when needed.
alter table public.revenus drop constraint if exists revenus_financial_period_id_fkey;
alter table public.revenus add constraint revenus_financial_period_id_fkey
  foreign key (financial_period_id) references public.financial_periods(id)
  on delete set null;

create or replace function public.delete_reference_pay_period()
returns trigger language plpgsql set search_path = public as $$
declare
  v_period record;
  v_previous_id text;
  v_next_start date;
  v_first_remaining date;
begin
  if not old.is_reference_pay then return old; end if;

  select * into v_period from public.financial_periods
  where reference_revenu_id = old.id and period_type = 'PAY_PERIOD';
  if not found then return old; end if;

  if exists (select 1 from public.epargne_mouvements where financial_period_id = v_period.id) then
    raise exception 'reference_pay_with_savings_movements_cannot_be_deleted';
  end if;

  select id into v_previous_id from public.financial_periods
  where user_id = v_period.user_id and period_type = 'PAY_PERIOD'
    and start_date < v_period.start_date
  order by start_date desc limit 1;
  select start_date into v_next_start from public.financial_periods
  where user_id = v_period.user_id and period_type = 'PAY_PERIOD'
    and start_date > v_period.start_date
  order by start_date asc limit 1;

  update public.charges
  set financial_period_id = v_previous_id
  where financial_period_id = v_period.id;
  update public.revenus
  set financial_period_id = v_previous_id
  where financial_period_id = v_period.id and id <> old.id;

  if v_previous_id is not null then
    update public.financial_periods
    set end_date = case when v_next_start is null then null else v_next_start - 1 end
    where id = v_previous_id;
  end if;

  delete from public.financial_periods where id = v_period.id;

  select min(start_date) into v_first_remaining from public.financial_periods
  where user_id = old.household_id and period_type = 'PAY_PERIOD';
  if v_first_remaining is null then
    delete from public.savings_period_settings where user_id = old.household_id;
  else
    update public.savings_period_settings
    set first_reference_pay_date = v_first_remaining
    where user_id = old.household_id;
  end if;
  return old;
end;
$$;

drop trigger if exists revenus_delete_reference_pay_period on public.revenus;
create trigger revenus_delete_reference_pay_period
after delete on public.revenus
for each row execute function public.delete_reference_pay_period();

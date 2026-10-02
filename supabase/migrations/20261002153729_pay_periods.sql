-- Financial periods are a solo-household preference. Existing households keep
-- the calendar-month behavior through the non-null default.
alter table public.households
  add column if not exists financial_period_mode text not null default 'CALENDAR_MONTH';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'households_financial_period_mode_check'
      and conrelid = 'public.households'::regclass
  ) then
    alter table public.households
      add constraint households_financial_period_mode_check
      check (financial_period_mode in ('CALENDAR_MONTH', 'PAY_PERIOD'));
  end if;
end $$;

-- A reference pay remains a normal revenue. Only this explicit flag gives it
-- the additional role of delimiting financial periods.
alter table public.revenus
  add column if not exists is_reference_pay boolean not null default false;

-- This supports loading reference-pay boundaries without scanning other income.
create index if not exists revenus_reference_pay_by_household_date_idx
  on public.revenus (household_id, date_reception)
  where is_reference_pay = true;

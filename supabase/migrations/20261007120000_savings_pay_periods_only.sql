-- Savings periods are immutable ledger entities.  Calendar periods created by
-- this migration are historical snapshots only; active savings always use pay
-- periods.
create table if not exists public.savings_period_settings (
  user_id text primary key references public.users(id) on delete cascade,
  first_reference_pay_date date not null,
  created_at timestamptz not null default now(),
  constraint savings_period_settings_first_pay_not_future check (first_reference_pay_date <= current_date)
);

create table if not exists public.financial_periods (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade,
  period_type text not null check (period_type in ('PAY_PERIOD', 'CALENDAR_HISTORICAL')),
  start_date date not null,
  end_date date,
  reference_revenu_id text,
  is_historical boolean not null default false,
  is_editable boolean not null default true,
  created_at timestamptz not null default now(),
  constraint financial_periods_valid_dates check (end_date is null or end_date >= start_date),
  constraint financial_periods_history_flags check (
    (period_type = 'CALENDAR_HISTORICAL' and is_historical and not is_editable)
    or (period_type = 'PAY_PERIOD' and not is_historical)
  ),
  unique (user_id, period_type, start_date),
  unique (reference_revenu_id)
);

create index if not exists financial_periods_user_start_idx
  on public.financial_periods (user_id, start_date desc);

alter table public.revenus add column if not exists financial_period_id text
  references public.financial_periods(id) on delete restrict;
alter table public.charges add column if not exists financial_period_id text
  references public.financial_periods(id) on delete restrict;
alter table public.epargne_mouvements add column if not exists financial_period_id text
  references public.financial_periods(id) on delete restrict;
create index if not exists revenus_financial_period_id_idx on public.revenus(financial_period_id);
create index if not exists charges_financial_period_id_idx on public.charges(financial_period_id);
create index if not exists epargne_mouvements_financial_period_id_idx on public.epargne_mouvements(financial_period_id);


-- Keep current data intact.  It has no trustworthy first-pay configuration,
-- so each existing savings month becomes a read-only historical period.
insert into public.financial_periods (user_id, period_type, start_date, end_date, is_historical, is_editable)
select distinct em.user_id, 'CALENDAR_HISTORICAL', date_trunc('month', em.date_mouvement)::date,
       (date_trunc('month', em.date_mouvement) + interval '1 month - 1 day')::date, true, false
from public.epargne_mouvements em
on conflict (user_id, period_type, start_date) do nothing;

update public.epargne_mouvements em
set financial_period_id = fp.id
from public.financial_periods fp
where em.financial_period_id is null
  and fp.user_id = em.user_id
  and fp.period_type = 'CALENDAR_HISTORICAL'
  and em.date_mouvement >= fp.start_date
  and em.date_mouvement <= fp.end_date;

-- A reference pay initialises exactly one anchor.  Later reference pays only
-- close the currently open period and create a new one; historic bounds are
-- never recomputed from arbitrary income edits.
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
  if new.household_id is distinct from new.beneficiaire then
    raise exception 'reference_pay_must_belong_to_solo_household';
  end if;

  select first_reference_pay_date into v_anchor
  from savings_period_settings where user_id = new.household_id;
  if v_anchor is null then
    insert into savings_period_settings (user_id, first_reference_pay_date)
    values (new.household_id, v_pay_date);
    v_anchor := v_pay_date;
  end if;
  if v_pay_date < v_anchor then
    raise exception 'reference_pay_before_initial_anchor';
  end if;
  select max(start_date) into v_previous_start from financial_periods
  where user_id = new.household_id and period_type = 'PAY_PERIOD';
  if v_previous_start is not null and v_pay_date <= v_previous_start then
    raise exception 'reference_pay_dates_must_be_added_in_chronological_order';
  end if;

  update financial_periods
  set end_date = v_pay_date - 1
  where user_id = new.household_id and period_type = 'PAY_PERIOD'
    and end_date is null;

  insert into financial_periods (user_id, period_type, start_date, reference_revenu_id)
  values (new.household_id, 'PAY_PERIOD', v_pay_date, new.id)
  returning id into v_period_id;
  new.financial_period_id := v_period_id;
  return new;
end;
$$;

create or replace function public.assign_financial_period_to_charge()
returns trigger language plpgsql set search_path = public as $$
begin
  select fp.id into new.financial_period_id
  from public.financial_periods fp
  join public.savings_period_settings s on s.user_id = fp.user_id
  where fp.user_id = new.household_id and fp.period_type = 'PAY_PERIOD'
    and new.date_statistiques::date >= s.first_reference_pay_date
    and new.date_statistiques::date >= fp.start_date
    and (fp.end_date is null or new.date_statistiques::date <= fp.end_date)
  order by fp.start_date desc limit 1;
  return new;
end;
$$;

create trigger revenus_create_pay_period
before insert on public.revenus
for each row execute function public.create_pay_period_from_reference_revenu();
create trigger charges_assign_financial_period
before insert on public.charges
for each row execute function public.assign_financial_period_to_charge();

-- A linked period is part of the savings ledger.  Reference dates and linked
-- movements cannot be silently moved to another period after creation.
create or replace function public.prevent_financial_ledger_mutation()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_table_name = 'revenus' and old.financial_period_id is not null
     and (new.is_reference_pay is distinct from old.is_reference_pay
       or new.date_reception is distinct from old.date_reception) then
    raise exception 'reference_pay_boundary_is_immutable';
  end if;
  if tg_table_name = 'epargne_mouvements' and old.financial_period_id is not null
     and new.financial_period_id is distinct from old.financial_period_id then
    raise exception 'savings_movement_period_is_immutable';
  end if;
  return new;
end;
$$;
create trigger revenus_protect_pay_boundary before update on public.revenus
for each row execute function public.prevent_financial_ledger_mutation();
create trigger epargne_mouvements_protect_period before update on public.epargne_mouvements
for each row execute function public.prevent_financial_ledger_mutation();

create or replace function public.validate_savings_movement_period()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists (
    select 1 from public.financial_periods fp
    where fp.id = new.financial_period_id and fp.user_id = new.user_id
      and fp.period_type = 'PAY_PERIOD' and new.date_mouvement >= fp.start_date
      and (fp.end_date is null or new.date_mouvement <= fp.end_date)
  ) then
    raise exception 'savings_movement_must_reference_its_owner_pay_period';
  end if;
  return new;
end;
$$;
create trigger epargne_mouvements_validate_period before insert on public.epargne_mouvements
for each row execute function public.validate_savings_movement_period();

-- The project presently authenticates with Firebase outside Supabase Auth;
-- these RLS policies deliberately mirror the existing application tables.
alter table public.savings_period_settings enable row level security;
alter table public.financial_periods enable row level security;
create policy "financial period settings client access" on public.savings_period_settings for all to public using (true) with check (true);
create policy "financial periods client access" on public.financial_periods for all to public using (true) with check (true);

-- Preserve the existing reset flow while also clearing the new ledger state.
alter function public.reset_user_data(text) rename to reset_user_data_legacy;
create function public.reset_user_data(p_user_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.reset_user_data_legacy(p_user_id);
  delete from public.savings_period_settings where user_id = p_user_id;
  delete from public.financial_periods where user_id = p_user_id;
end;
$$;
revoke all on function public.reset_user_data(text) from public, anon, authenticated;
grant execute on function public.reset_user_data(text) to service_role;

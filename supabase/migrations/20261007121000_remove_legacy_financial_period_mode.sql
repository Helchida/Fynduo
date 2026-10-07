-- Calendar months remain available for statistics only; they are no longer a
-- selectable financial mode for savings.
alter table public.households drop constraint if exists households_financial_period_mode_check;
alter table public.households drop column if exists financial_period_mode;

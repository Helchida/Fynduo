-- Non-transferable funds remain ordinary financial flows.  These flags are
-- consumed only by the bank-savings-capacity calculation in the client.
alter table public.revenus
  add column if not exists is_non_transferable boolean not null default false;

alter table public.charges
  add column if not exists is_non_transferable boolean not null default false;

-- A fixed-charge template must retain the choice when it creates future
-- charge occurrences through the existing Edge Function/RPC path.
alter table public.charges_fixes
  add column if not exists is_non_transferable boolean not null default false;

comment on column public.revenus.is_non_transferable is
  'Funds usable through a dedicated means of payment and excluded from bank savings capacity.';
comment on column public.charges.is_non_transferable is
  'Expense paid with non-transferable funds and excluded from bank savings capacity.';

-- The Firebase-authenticated charge creation RPC is the only insert path.
-- Keep its existing validation, notification and idempotency behaviour while
-- persisting the additional boolean explicitly.
create or replace function public.create_charge_with_notifications(
  p_charge_id text,
  p_household_id text,
  p_author_id text,
  p_type text,
  p_categorie text,
  p_description text,
  p_montant_total numeric,
  p_payeur text,
  p_beneficiaires text[],
  p_date_statistiques timestamptz,
  p_mois_annee text,
  p_scope text,
  p_nature text,
  p_repartition jsonb default null,
  p_is_non_transferable boolean default false
)
returns table (charge_id text, notification_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_members text[];
  v_author_name text;
  v_recipient text;
  v_count integer := 0;
  v_message text;
begin
  select members into v_members from households where id = p_household_id for share;
  if v_members is null or not (p_author_id = any(v_members)) then
    raise exception 'forbidden household membership' using errcode = '42501';
  end if;
  if p_beneficiaires is null or cardinality(p_beneficiaires) = 0 then
    raise exception 'at least one beneficiary is required' using errcode = '22023';
  end if;

  insert into charges (
    id, household_id, type, categorie, description, montant_total, payeur,
    beneficiaires, date_statistiques, mois_annee, scope, nature, repartition,
    created_by, is_non_transferable
  ) values (
    p_charge_id, p_household_id, p_type, nullif(p_categorie, ''), p_description,
    p_montant_total, p_payeur, p_beneficiaires, p_date_statistiques,
    p_mois_annee, p_scope, p_nature, p_repartition, p_author_id,
    coalesce(p_is_non_transferable, false)
  ) on conflict (id) do nothing;
  if not found then
    return query select p_charge_id, 0;
    return;
  end if;

  select coalesce(display_name, 'Un membre du foyer') into v_author_name
  from users where id = p_author_id;
  v_message := format('%s a ajouté une dépense de %s €%s.', v_author_name,
    to_char(p_montant_total, 'FM999G999G990D00'),
    case when coalesce(p_description, '') = '' then '' else ' pour ' || p_description end);

  for v_recipient in
    select distinct beneficiary from unnest(p_beneficiaires) as beneficiary
    where beneficiary = any(v_members) and beneficiary <> p_author_id
  loop
    insert into notifications (
      user_id, household_id, charge_id, event_key, type, title, message, metadata
    ) values (
      v_recipient, p_household_id, p_charge_id,
      'expense_created:' || p_charge_id || ':' || v_recipient,
      'expense_created', 'Nouvelle dépense', v_message,
      jsonb_build_object('chargeId', substring(p_charge_id from char_length(p_household_id) + 2),
        'householdId', p_household_id, 'authorId', p_author_id)
    ) on conflict (event_key) do nothing;
    if found then v_count := v_count + 1; end if;
  end loop;
  return query select p_charge_id, v_count;
end;
$$;

revoke all on function public.create_charge_with_notifications(
  text, text, text, text, text, text, numeric, text, text[], timestamptz,
  text, text, text, jsonb, boolean
) from public, anon, authenticated;
grant execute on function public.create_charge_with_notifications(
  text, text, text, text, text, text, numeric, text, text[], timestamptz,
  text, text, text, jsonb, boolean
) to service_role;

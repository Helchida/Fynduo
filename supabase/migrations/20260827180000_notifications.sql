-- Notifications are only accessed through Firebase-authenticated Edge Functions.
-- RLS intentionally has no client policies: the browser never receives a
-- Supabase session and therefore cannot be trusted with a recipient id.

create extension if not exists pgcrypto;

alter table public.charges
  add column if not exists created_by text;

-- New expenses must use the Firebase-authenticated create-charge Edge
-- Function.  This prevents a browser from forging a creator or bypassing the
-- recipient exclusion rule. Existing reads/updates are intentionally left to
-- the current application migration and are outside this notification change.
revoke insert on public.charges from public, anon, authenticated;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  household_id text not null references public.households(id) on delete cascade,
  charge_id text not null references public.charges(id) on delete cascade,
  event_key text not null unique,
  type text not null check (type in ('expense_created')),
  title text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_unread_created_idx
  on public.notifications (user_id, created_at desc) where read_at is null;
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  platform text not null default 'web',
  fingerprint text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  invalidated_at timestamptz
);

create index if not exists push_subscriptions_user_active_idx
  on public.push_subscriptions (user_id) where active;

alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;

-- There is deliberately no policy for anon/authenticated. Firebase ID tokens
-- are validated by Edge Functions, which use the service role server-side.

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
  p_repartition jsonb default null
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
    created_by
  ) values (
    p_charge_id, p_household_id, p_type, nullif(p_categorie, ''), p_description,
    p_montant_total, p_payeur, p_beneficiaires, p_date_statistiques,
    p_mois_annee, p_scope, p_nature, p_repartition, p_author_id
  ) on conflict (id) do nothing;
  if not found then
    -- The client may retry after a lost HTTP response. The original expense
    -- and notifications are already durable, so do not duplicate either.
    return query select p_charge_id, 0;
    return;
  end if;

  select coalesce(display_name, 'Un membre du foyer') into v_author_name
  from users where id = p_author_id;
  v_message := format('%s a ajouté une dépense de %s €%s.',
    v_author_name,
    to_char(p_montant_total, 'FM999G999G990D00'),
    case when coalesce(p_description, '') = '' then '' else ' pour ' || p_description end
  );

  -- DISTINCT + unique event_key make retries idempotent.  The author is
  -- excluded in the database, even when selected as a beneficiary.
  for v_recipient in
    select distinct beneficiary
    from unnest(p_beneficiaires) as beneficiary
    where beneficiary = any(v_members)
      and beneficiary <> p_author_id
  loop
    insert into notifications (
      user_id, household_id, charge_id, event_key, type, title, message, metadata
    ) values (
      v_recipient, p_household_id, p_charge_id,
      'expense_created:' || p_charge_id || ':' || v_recipient,
      'expense_created', 'Nouvelle dépense', v_message,
      jsonb_build_object('chargeId', substring(p_charge_id from char_length(p_household_id) + 2), 'householdId', p_household_id,
                         'authorId', p_author_id)
    ) on conflict (event_key) do nothing;
    if found then v_count := v_count + 1; end if;
  end loop;

  return query select p_charge_id, v_count;
end;
$$;

revoke all on function public.create_charge_with_notifications(
  text, text, text, text, text, text, numeric, text, text[], timestamptz,
  text, text, text, jsonb
) from public, anon, authenticated;


-- ============================================
-- RESET COMPLET DES DONNÉES UTILISATEUR
-- ============================================
--
-- Cette fonction ne supprime PAS le compte Firebase.
-- Elle réinitialise uniquement les données applicatives.
--
-- Elle est volontairement accessible uniquement au service_role.
-- L'identité Firebase est vérifiée par l'Edge Function avant appel.
--

create or replace function public.reset_user_data(
  p_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
  v_household_ids text[];
  v_household_id text;
  v_members text[];
begin

  -- Vérifier que l'utilisateur existe
  select
    display_name,
    households
  into
    v_display_name,
    v_household_ids
  from public.users
  where id = p_user_id;

  if not found then
    raise exception 'user_not_found';
  end if;


  -- ============================================
  -- 1. NOTIFICATIONS PERSONNELLES
  -- ============================================

  delete from public.notifications
  where user_id = p_user_id;

  delete from public.push_subscriptions
  where user_id = p_user_id;


  -- ============================================
  -- 2. ÉPARGNE PERSONNELLE
  -- ============================================

  -- Les mouvements doivent être supprimés avant les tirelires
  -- puisqu'ils référencent les tirelires.
  delete from public.epargne_mouvements
  where user_id = p_user_id;

  delete from public.tirelires
  where user_id = p_user_id;


  -- ============================================
  -- 3. RETIRER L'UTILISATEUR DES FOYERS PARTAGÉS
  -- ============================================

  foreach v_household_id in
    array coalesce(v_household_ids, array[]::text[])
  loop

    -- Le foyer solo possède le même ID que l'utilisateur.
    if v_household_id <> p_user_id then

      select members
      into v_members
      from public.households
      where id = v_household_id;

      if found then

        v_members :=
          array_remove(
            coalesce(v_members, array[]::text[]),
            p_user_id
          );

        update public.households
        set
          members = v_members,
          updated_at = now()
        where id = v_household_id;

      end if;

    end if;

  end loop;


  -- ============================================
  -- 4. SUPPRESSION DES DONNÉES DU FOYER SOLO
  -- ============================================

  -- Notifications du foyer solo
  delete from public.notifications
  where household_id = p_user_id;


  -- Les notifications référencent les charges :
  -- elles doivent donc être supprimées avant les charges.
  delete from public.charges
  where household_id = p_user_id;

  delete from public.charges_fixes
  where household_id = p_user_id;

  delete from public.comptes_mensuels
  where household_id = p_user_id;

  delete from public.loyer_config
  where household_id = p_user_id;

  delete from public.revenus
  where household_id = p_user_id;

  delete from public.categories
  where household_id = p_user_id;

  delete from public.categories_revenus
  where household_id = p_user_id;


  -- ============================================
  -- 5. RÉINITIALISATION DU FOYER SOLO
  -- ============================================

  update public.households
  set
    name = 'Foyer de ' || coalesce(
      nullif(trim(v_display_name), ''),
      'mon compte'
    ),
    invitation_code = null,
    invitation_expires_at = null,
    members = array[p_user_id],
    updated_at = now()
  where id = p_user_id;


  -- ============================================
  -- 6. CATÉGORIES DE DÉPENSES PAR DÉFAUT
  -- ============================================

  insert into public.categories (
    id,
    household_id,
    label,
    icon,
    is_default
  )
  values
    (p_user_id || '_cat_autre', p_user_id, 'Autre', '📦', true),
    (p_user_id || '_cat_loisirs', p_user_id, 'Loisirs', '🎉', false),
    (p_user_id || '_cat_restaurants', p_user_id, 'Restaurants et Bars', '🍸', false),
    (p_user_id || '_cat_courses', p_user_id, 'Courses', '🛒', false),
    (p_user_id || '_cat_transports', p_user_id, 'Transports', '🚗', false),
    (p_user_id || '_cat_shopping', p_user_id, 'Shopping', '👜', false),
    (p_user_id || '_cat_maison', p_user_id, 'Maison', '🏠', false),
    (p_user_id || '_cat_sante', p_user_id, 'Santé', '💊', false),
    (p_user_id || '_cat_remboursement', p_user_id, 'Remboursement', '🤝', false);


  -- ============================================
  -- 7. CATÉGORIES DE REVENUS PAR DÉFAUT
  -- ============================================

  insert into public.categories_revenus (
    id,
    household_id,
    label,
    icon,
    is_default
  )
  values
    (p_user_id || '_cat_salaire', p_user_id, 'Salaire', '💼', false),
    (p_user_id || '_cat_apl', p_user_id, 'APL', '🏠', false),
    (p_user_id || '_cat_prime_activite', p_user_id, 'Prime d''activité', '💰', false),
    (p_user_id || '_cat_allocation_chomage', p_user_id, 'Allocation chômage', '🎯', false),
    (p_user_id || '_cat_pension', p_user_id, 'Pension / Retraite', '👴', false),
    (p_user_id || '_cat_prime', p_user_id, 'Prime', '⭐', false),
    (p_user_id || '_cat_investissement', p_user_id, 'Dividendes / Intérêts', '📈', false),
    (p_user_id || '_cat_remboursement_revenu', p_user_id, 'Remboursement', '↩️', false),
    (p_user_id || '_cat_don', p_user_id, 'Don / Cadeau', '🎁', false),
    (p_user_id || '_cat_autre', p_user_id, 'Autre', '💵', true),
    (p_user_id || '_cat_retrait_epargne', p_user_id, 'Retrait Épargne', '🔨', false);


  -- ============================================
  -- 8. RÉINITIALISER LE PROFIL DE FOYERS
  -- ============================================

  update public.users
  set
    households = array[p_user_id],
    active_household_id = p_user_id,
    updated_at = now()
  where id = p_user_id;

end;
$$;


-- La fonction ne doit surtout pas être appelable directement
-- par le navigateur.
revoke all on function public.reset_user_data(text)
from public, anon, authenticated;

grant execute on function public.reset_user_data(text)
to service_role;
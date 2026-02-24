import dayjs from "dayjs";
import {
  ICompteMensuel,
  IChargeFixeSnapshot,
  IDette,
  IUser,
  ICategorie,
  ILoyerConfig,
  ICharge,
  IChargeFixeTemplate,
  ICategorieRevenu,
  IRevenu,
} from "../../types";
import { DEFAULT_CATEGORIES } from "constants/categories";
import { supabase } from "../supabase/config";
import { DEFAULT_CATEGORIES_REVENUS } from "constants/categories_revenus";

// ============================================
// HELPERS
// ============================================

/**
 * Génère un ID unique pour PostgreSQL (householdId_docId)
 */
const makeUniqueId = (householdId: string, docId: string) => {
  return `${householdId}_${docId}`;
};

/**
 * Extrait le docId d'un ID unique PostgreSQL
 * Ex: "household123_doc456" => "doc456"
 */
const extractDocId = (uniqueId: string) => {
  const parts = uniqueId.split('_');
  return parts.slice(1).join('_'); // Au cas où l'ID contient des underscores
};

/**
 * Génère un ID aléatoire (compatible Firebase)
 */
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// ============================================
// USERS
// ============================================

/**
 * Crée un profil utilisateur après l'inscription
 */
export async function createUserProfile(
  uid: string,
  data: {
    email: string;
    displayName: string;
    activeHouseholdId: string;
    households: string[];
  },
) {
  try {
    const { error } = await supabase.from('users').insert({
      id: uid,
      email: data.email,
      display_name: data.displayName,
      active_household_id: data.activeHouseholdId,
      households: data.households,
    });

    if (error) throw error;

    // Créer le foyer solo (household avec même ID que l'user)
    await supabase.from('households').insert({
      id: uid,
      name: `Foyer de ${data.displayName}`,
      members: [uid],
    });

    // Créer les catégories par défaut
    await createDefaultCategories(uid);
    await createDefaultCategoriesRevenus(uid);
  } catch (error) {
    console.error("Erreur lors de la création du profil utilisateur:", error);
    throw error;
  }
}

/**
 * Modifie les infos d'un utilisateur
 */
export async function updateUserInfo(uid: string, data: any) {
  const supabaseUpdates: any = {};
  
  if (data.displayName !== undefined) supabaseUpdates.display_name = data.displayName;
  if (data.email !== undefined) supabaseUpdates.email = data.email;

  try {
    const { error } = await supabase
      .from('users')
      .update(supabaseUpdates)
      .eq('id', uid);
    
    if (error) throw error;
  } catch (error) {
    console.error("Erreur updateUserInfo:", error);
    throw error;
  }
}

/**
 * Supprime un utilisateur
 */
export async function deleteUserInfo(uid: string) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', uid);
    
    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la suppression du profil:", error);
    throw error;
  }
}

/**
 * Récupère tous les utilisateurs appartenant à un household
 */
export async function getHouseholdUsers(householdId: string): Promise<IUser[]> {
  try {
    // 1. Récupérer les membres du household
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('members')
      .eq('id', householdId)
      .single();

    if (householdError || !householdData) {
      return [];
    }

    const memberIds = householdData.members || [];

    if (memberIds.length === 0) {
      return [];
    }

    // 2. Récupérer tous les users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', memberIds);

    if (usersError) throw usersError;

    return (users || []).map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      activeHouseholdId: user.active_household_id,
      households: user.households || [],
    }));
  } catch (error) {
    console.error("Erreur getHouseholdMembers:", error);
    throw error;
  }
}

// ============================================
// LOYER CONFIG
// ============================================

/**
 * Récupère la configuration active du loyer
 */
export async function getLoyerConfig(
  householdId: string,
): Promise<ILoyerConfig | null> {
  const uniqueId = makeUniqueId(householdId, 'current');
  
  const { data, error } = await supabase
    .from('loyer_config')
    .select('*')
    .eq('id', uniqueId)
    .single();

  if (error || !data) return null;

  return {
    id: 'current',
    loyerTotal: data.loyer_total,
    apportsAPL: data.apports_apl,
    loyerPayeurUid: data.loyer_payeur_uid,
    dateModification: data.date_modification,
  };
}

/**
 * Met à jour la configuration du loyer
 */
export async function updateLoyerConfig(
  householdId: string,
  loyerTotal: number,
  apportsAPL: Record<string, number>,
  loyerPayeurUid: string,
): Promise<void> {
  const uniqueId = makeUniqueId(householdId, 'current');

  const { error } = await supabase
    .from('loyer_config')
    .upsert({
      id: uniqueId,
      household_id: householdId,
      loyer_total: loyerTotal,
      apports_apl: apportsAPL,
      loyer_payeur_uid: loyerPayeurUid,
      date_modification: new Date().toISOString(),
    });

  if (error) throw error;
}

/**
 * Initialise la config loyer pour un nouveau foyer
 */
export async function initLoyerConfig(
  householdId: string,
  members: string[],
): Promise<void> {
  const apportsAPL: Record<string, number> = {};
  members.forEach((uid) => {
    apportsAPL[uid] = 0;
  });

  await updateLoyerConfig(householdId, 0, apportsAPL, members[0] || "");
}

// ============================================
// COMPTES MENSUELS
// ============================================

/**
 * Créer les données du compte mensuel
 */
export async function createCompteMensuel(
  householdId: string,
  data: ICompteMensuel,
): Promise<void> {
  try {
    const uniqueId = makeUniqueId(householdId, data.id);

    const { error } = await supabase
      .from('comptes_mensuels')
      .upsert({
        id: uniqueId,
        household_id: householdId,
        mois_annee: data.moisAnnee,
        statut: data.statut === 'finalisé' ? 'finalise' : data.statut,
        apports_apl: data.apportsAPL,
        dettes: data.dettes,
        charges_fixes_snapshot: data.chargesFixesSnapshot,
        loyer_total: data.loyerTotal,
        loyer_payeur_uid: data.loyerPayeurUid,
      });

    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la création du compte mensuel:", error);
    throw error;
  }
}

/**
 * Récupérer les données du compte mensuel pour un mois donné
 */
export async function getCompteMensuel(
  householdId: string,
  moisAnnee: string,
): Promise<ICompteMensuel | null> {
  const uniqueId = makeUniqueId(householdId, moisAnnee);

  const { data, error } = await supabase
    .from('comptes_mensuels')
    .select('*')
    .eq('id', uniqueId)
    .single();

  if (error || !data) return null;

  return {
    id: moisAnnee,
    moisAnnee: data.mois_annee,
    statut: data.statut === 'finalise' ? 'finalisé' : data.statut,
    apportsAPL: data.apports_apl,
    dettes: data.dettes,
    chargesFixesSnapshot: data.charges_fixes_snapshot,
    loyerTotal: data.loyer_total,
    loyerPayeurUid: data.loyer_payeur_uid,
  };
}

/**
 * Met à jour les montants Loyer et APL d'un compte mensuel
 */
export async function updateLoyerApl(
  householdId: string,
  compteDocId: string,
  loyerTotal: number,
  apportsAPL: Record<string, number>,
  loyerPayeurUid: string,
) {
  const uniqueId = makeUniqueId(householdId, compteDocId);

  const { error } = await supabase
    .from('comptes_mensuels')
    .update({
      loyer_total: loyerTotal,
      apports_apl: apportsAPL,
      loyer_payeur_uid: loyerPayeurUid,
    })
    .eq('id', uniqueId);

  if (error) throw error;
}

/**
 * Modifie un mois comme 'finalisé' dans la base
 */
export async function setMoisFinalise(
  householdId: string,
  compteDocId: string,
) {
  const uniqueId = makeUniqueId(householdId, compteDocId);

  const { error } = await supabase
    .from('comptes_mensuels')
    .update({ statut: 'finalise' })
    .eq('id', uniqueId);

  if (error) throw error;
}

/**
 * Récupère tous les comptes mensuels finalisés (historique)
 */
export async function getHistoryMonths(
  householdId: string,
): Promise<ICompteMensuel[]> {
  try {
    const { data, error } = await supabase
      .from('comptes_mensuels')
      .select('*')
      .eq('household_id', householdId)
      .eq('statut', 'finalise');

    if (error) throw error;

    return (data || []).map((row) => ({
      id: extractDocId(row.id),
      moisAnnee: row.mois_annee,
      statut: 'finalisé',
      apportsAPL: row.apports_apl,
      dettes: row.dettes,
      chargesFixesSnapshot: row.charges_fixes_snapshot,
      loyerTotal: row.loyer_total,
      loyerPayeurUid: row.loyer_payeur_uid,
    }));
  } catch (error) {
    console.error("Erreur getHistoryMonths:", error);
    throw error;
  }
}

/**
 * Modifier le compte mensuel (régularisation dettes)
 */
export async function updateRegularisationDettes(
  householdId: string,
  moisAnnee: string,
  dettes: IDette[],
  chargesFixesSnapshot: IChargeFixeSnapshot[],
): Promise<void> {
  try {
    const uniqueId = makeUniqueId(householdId, moisAnnee);

    const { error } = await supabase
      .from('comptes_mensuels')
      .update({
        dettes: dettes,
        charges_fixes_snapshot: chargesFixesSnapshot,
      })
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur updateRegularisationDettes:", error);
    throw error;
  }
}

// ============================================
// CHARGES FIXES (TEMPLATES)
// ============================================

/**
 * Récupère les templates des charges fixes
 */
export async function getChargesFixesConfigs(
  householdId: string,
): Promise<IChargeFixeTemplate[]> {
  const { data, error } = await supabase
    .from('charges_fixes')
    .select('*')
    .eq('household_id', householdId);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: extractDocId(row.id),
    householdId: row.household_id,
    categorie: row.categorie,
    description: row.description,
    montantTotal: row.montant_total,
    payeur: row.payeur,
    beneficiaires: row.beneficiaires || [],
    jourPrelevementMensuel: row.jour_prelevement_mensuel,
    scope: row.scope,
  }));
}

/**
 * Ajoute un nouveau template de charge fixe
 */
export async function addChargeFixeConfig(
  householdId: string,
  charge: Omit<IChargeFixeTemplate, "id" | "householdId">,
): Promise<string> {
  const docId = generateId();
  const uniqueId = makeUniqueId(householdId, docId);

  const { error } = await supabase
    .from('charges_fixes')
    .insert({
      id: uniqueId,
      household_id: householdId,
      categorie: charge.categorie || null,
      description: charge.description,
      montant_total: charge.montantTotal,
      payeur: charge.payeur,
      beneficiaires: charge.beneficiaires || [],
      jour_prelevement_mensuel: charge.jourPrelevementMensuel,
      scope: charge.scope || 'solo',
    });

  if (error) throw error;

  return docId;
}

/**
 * Met à jour un template de charge fixe
 */
export async function updateChargeFixeConfig(
  householdId: string,
  chargeId: string,
  updates: Partial<Omit<IChargeFixeTemplate, "id">>,
) {
  const uniqueId = makeUniqueId(householdId, chargeId);
  const supabaseUpdates: any = {};

  if (updates.categorie !== undefined) supabaseUpdates.categorie = updates.categorie;
  if (updates.description !== undefined) supabaseUpdates.description = updates.description;
  if (updates.montantTotal !== undefined) supabaseUpdates.montant_total = updates.montantTotal;
  if (updates.payeur !== undefined) supabaseUpdates.payeur = updates.payeur;
  if (updates.beneficiaires !== undefined) supabaseUpdates.beneficiaires = updates.beneficiaires;
  if (updates.jourPrelevementMensuel !== undefined) supabaseUpdates.jour_prelevement_mensuel = updates.jourPrelevementMensuel;
  if (updates.scope !== undefined) supabaseUpdates.scope = updates.scope;

  const { error } = await supabase
    .from('charges_fixes')
    .update(supabaseUpdates)
    .eq('id', uniqueId);

  if (error) throw error;
}

/**
 * Supprime une charge fixe
 */
export async function deleteChargeFixeConfig(
  householdId: string,
  chargeId: string,
) {
  const uniqueId = makeUniqueId(householdId, chargeId);

  const { error } = await supabase
    .from('charges_fixes')
    .delete()
    .eq('id', uniqueId);

  if (error) throw error;
}

// ============================================
// CHARGES (DÉPENSES RÉELLES)
// ============================================

/**
 * Récupère les charges par type
 */
export async function getChargesByType<T extends ICharge>(
  householdId: string,
  type: "fixe" | "variable",
): Promise<T[]> {
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .eq('household_id', householdId)
    .eq('type', type);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: extractDocId(row.id),
    householdId: row.household_id,
    type: row.type,
    categorie: row.categorie,
    description: row.description,
    montantTotal: row.montant_total,
    payeur: row.payeur,
    beneficiaires: row.beneficiaires || [],
    dateStatistiques: row.date_statistiques,
    moisAnnee: row.mois_annee,
    scope: row.scope,
  })) as T[];
}

/**
 * Récupère toutes les charges d'un foyer
 */
export async function getAllCharges(
  householdId: string,
): Promise<ICharge[]> {
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .eq('household_id', householdId);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: extractDocId(row.id),
    householdId: row.household_id,
    type: row.type,
    categorie: row.categorie,
    description: row.description,
    montantTotal: row.montant_total,
    payeur: row.payeur,
    beneficiaires: row.beneficiaires || [],
    dateStatistiques: row.date_statistiques,
    moisAnnee: row.mois_annee,
    scope: row.scope,
  }));
}

/**
 * Récupère les charges où l'utilisateur est bénéficiaire (multi-foyers)
 */
export async function getSoloChargesByType<T extends ICharge>(
  householdIds: string[],
  userId: string,
  type: "fixe" | "variable",
): Promise<T[]> {
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .in('household_id', householdIds)
    .eq('type', type)
    .contains('beneficiaires', [userId]);

  if (error) throw error;

  const charges = (data || []).map((row) => ({
    id: extractDocId(row.id),
    householdId: row.household_id,
    type: row.type,
    categorie: row.categorie,
    description: row.description,
    montantTotal: row.montant_total,
    payeur: row.payeur,
    beneficiaires: row.beneficiaires || [],
    dateStatistiques: row.date_statistiques,
    moisAnnee: row.mois_annee,
    scope: row.scope,
  })) as T[];

  // Trier par date
  return charges.sort((a, b) => {
    const dateA = (a as any).dateStatistiques;
    const dateB = (b as any).dateStatistiques;
    return dateB.localeCompare(dateA);
  });
}

/**
 * Ajoute une nouvelle charge
 */
export async function addCharge(
  householdId: string,
  charge: Omit<ICharge, "id" | "householdId">
) {
  const docId = generateId();
  const uniqueId = makeUniqueId(householdId, docId);

  // 1. Insérer la charge
  const { error } = await supabase
    .from('charges')
    .insert({
      id: uniqueId,
      household_id: householdId,
      type: charge.type || 'variable',
      categorie: charge.categorie || null,
      description: charge.description,
      montant_total: charge.montantTotal,
      payeur: charge.payeur,
      beneficiaires: charge.beneficiaires || [],
      date_statistiques: (charge as any).dateStatistiques,
      mois_annee: (charge as any).moisAnnee,
      scope: (charge as any).scope || 'partage',
      jour_prelevement_mensuel: (charge as any).jourPrelevementMensuel,
    });

  if (error) throw error;

  // 2. Propager la catégorie aux foyers solo des bénéficiaires
  try {
    const { data: householdData } = await supabase
      .from('households')
      .select('members')
      .eq('id', householdId)
      .single();

    if (householdData) {
      const members = householdData.members || [];
      const realUserBeneficiaires = charge.beneficiaires.filter(
        (uid) => members.includes(uid) && uid !== householdId,
      );

      if (realUserBeneficiaires.length > 0 && charge.categorie) {
        // Récupérer la catégorie
        const catUniqueId = makeUniqueId(householdId, charge.categorie);
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', catUniqueId)
          .single();

        if (categoryData) {
          // Propager aux foyers solo
          const categoriesToInsert = realUserBeneficiaires.map((userId) => ({
            id: makeUniqueId(userId, charge.categorie),
            household_id: userId,
            label: categoryData.label,
            icon: categoryData.icon,
            is_default: categoryData.is_default,
          }));

          await supabase
            .from('categories')
            .upsert(categoriesToInsert, { onConflict: 'id' });
        }
      }
    }
  } catch (error) {
    console.warn("Erreur propagation catégorie:", error);
  }

  return docId;
}

/**
 * Met à jour une charge
 */
export async function updateCharge(
  householdId: string,
  chargeId: string,
  updateData: Partial<Omit<ICharge, "id" | "householdId" | "moisAnnee">>,
) {
  try {
    const uniqueId = makeUniqueId(householdId, chargeId);
    const supabaseUpdates: any = {};

    if (updateData.categorie !== undefined) supabaseUpdates.categorie = updateData.categorie;
    if (updateData.description !== undefined) supabaseUpdates.description = updateData.description;
    if ((updateData as any).montantTotal !== undefined) supabaseUpdates.montant_total = (updateData as any).montantTotal;
    if (updateData.payeur !== undefined) supabaseUpdates.payeur = updateData.payeur;
    if (updateData.beneficiaires !== undefined) supabaseUpdates.beneficiaires = updateData.beneficiaires;
    if ((updateData as any).dateStatistiques !== undefined) supabaseUpdates.date_statistiques = (updateData as any).dateStatistiques;
    if ((updateData as any).moisAnnee !== undefined) supabaseUpdates.mois_annee = (updateData as any).moisAnnee;
    if ((updateData as any).scope !== undefined) supabaseUpdates.scope = (updateData as any).scope;

    const { error } = await supabase
      .from('charges')
      .update(supabaseUpdates)
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur updateCharge:", error);
    throw error;
  }
}

/**
 * Supprime une charge
 */
export async function deleteCharge(householdId: string, chargeId: string) {
  try {
    const uniqueId = makeUniqueId(householdId, chargeId);

    const { error } = await supabase
      .from('charges')
      .delete()
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur deleteCharge:", error);
    throw error;
  }
}

/**
 * Ajoute une charge de régularisation
 */
export async function addChargeVariableRegularisation(
  householdId: string,
  moisAnnee: string,
  dettesRegularisation: IDette[],
) {
  const dateRegul = dayjs().toISOString();
  const dettesRegularisationPositives = dettesRegularisation.filter(
    (d) => d.montant > 0,
  );
  
  for (const detteRegularisation of dettesRegularisationPositives) {
    await addCharge(householdId, {
      description: "Régularisation Trésorerie",
      montantTotal: detteRegularisation.montant,
      payeur: detteRegularisation.debiteurUid,
      beneficiaires: [detteRegularisation.creancierUid],
      dateStatistiques: dateRegul,
      moisAnnee: moisAnnee,
      categorie: "Remboursement",
      type: "variable",
      scope: "partage",
    });
  }

  return Promise.resolve();
}

// ============================================
// CATÉGORIES
// ============================================

/**
 * Récupère toutes les catégories d'un foyer
 */
export async function getHouseholdCategories(
  householdId: string,
): Promise<ICategorie[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('household_id', householdId);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: extractDocId(row.id),
      label: row.label,
      icon: row.icon,
      isDefault: row.is_default,
    }));
  } catch (error) {
    console.error("Erreur getHouseholdCategories:", error);
    throw error;
  }
}

/**
 * Ajoute une catégorie
 */
export async function addCategory(
  householdId: string,
  category: Omit<ICategorie, "id">,
) {
  try {
    const newCatId = generateId();
    const uniqueId = makeUniqueId(householdId, newCatId);

    // 1. Créer la catégorie dans le foyer principal
    const { error } = await supabase
      .from('categories')
      .insert({
        id: uniqueId,
        household_id: householdId,
        label: category.label,
        icon: category.icon,
        is_default: category.isDefault || false,
      });

    if (error) throw error;

    // 2. Propager aux foyers solo des membres
    const { data: householdData } = await supabase
      .from('households')
      .select('members')
      .eq('id', householdId)
      .single();

    if (householdData) {
      const members = householdData.members || [];
      const categoriesToInsert = members
        .filter((uid: string) => uid !== householdId)
        .map((uid: string) => ({
          id: makeUniqueId(uid, newCatId),
          household_id: uid,
          label: category.label,
          icon: category.icon,
          is_default: category.isDefault || false,
        }));

      if (categoriesToInsert.length > 0) {
        await supabase
          .from('categories')
          .upsert(categoriesToInsert, { onConflict: 'id' });
      }
    }

    return newCatId;
  } catch (error) {
    console.error("Erreur addCategory:", error);
    throw error;
  }
}

/**
 * Met à jour une catégorie
 */
export async function updateCategory(
  householdId: string,
  categoryId: string,
  updateData: Partial<ICategorie>,
) {
  try {
    const uniqueId = makeUniqueId(householdId, categoryId);
    const supabaseUpdates: any = {};

    if (updateData.label !== undefined) supabaseUpdates.label = updateData.label;
    if (updateData.icon !== undefined) supabaseUpdates.icon = updateData.icon;

    // 1. Mettre à jour dans le foyer principal
    const { error } = await supabase
      .from('categories')
      .update(supabaseUpdates)
      .eq('id', uniqueId);

    if (error) throw error;

    // 2. Propager aux foyers solo
    const { data: householdData } = await supabase
      .from('households')
      .select('members')
      .eq('id', householdId)
      .single();

    if (householdData) {
      const members = householdData.members || [];
      
      for (const uid of members) {
        if (uid !== householdId) {
          const soloCatId = makeUniqueId(uid, categoryId);
          await supabase
            .from('categories')
            .update(supabaseUpdates)
            .eq('id', soloCatId);
        }
      }
    }
  } catch (error) {
    console.error("Erreur updateCategory:", error);
    throw error;
  }
}

/**
 * Supprime une catégorie
 */
export async function deleteCategory(householdId: string, categoryId: string) {
  try {
    const uniqueId = makeUniqueId(householdId, categoryId);

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur deleteCategory:", error);
    throw error;
  }
}

/**
 * Migre les charges lors de la suppression d'une catégorie
 */
export async function migrateChargesOnDelete(
  householdId: string,
  oldCategoryId: string,
  defaultCategoryId: string,
) {
  const { error } = await supabase
    .from('charges')
    .update({ categorie: defaultCategoryId })
    .eq('household_id', householdId)
    .eq('categorie', oldCategoryId);

  if (error) throw error;
}

// ============================================
// HOUSEHOLDS
// ============================================

/**
 * Change le foyer actif d'un utilisateur
 */
export async function switchActiveHousehold(
  userId: string,
  newHouseholdId: string,
) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ active_household_id: newHouseholdId })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur switch household:", error);
    throw error;
  }
}

/**
 * Crée un nouveau foyer partagé
 */
export async function createHousehold(userId: string, name: string) {
  try {
    const householdId = generateId();

    // 1. Créer le household
    const { error: householdError } = await supabase
      .from('households')
      .insert({
        id: householdId,
        name,
        members: [userId],
      });

    if (householdError) throw householdError;

    // 2. Ajouter à la liste de l'utilisateur
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('households')
      .eq('id', userId)
      .single();

    if (userFetchError) throw userFetchError;

    const updatedHouseholds = [...(userData?.households || []), householdId];

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ households: updatedHouseholds })
      .eq('id', userId);

    if (userUpdateError) throw userUpdateError;

    // 3. Créer les catégories par défaut
    await createDefaultCategories(householdId);

    return householdId;
  } catch (error) {
    console.error("Erreur createHousehold:", error);
    throw error;
  }
}

/**
 * Génère un code d'invitation
 */
export async function generateInvitationCode(householdId: string) {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = dayjs().add(24, "hours").toISOString();

    const { error } = await supabase
      .from('households')
      .update({
        invitation_code: code,
        invitation_expires_at: expiresAt,
      })
      .eq('id', householdId);

    if (error) throw error;

    return code;
  } catch (error) {
    console.error("Erreur génération code:", error);
    throw error;
  }
}

/**
 * Rejoint un foyer via code d'invitation
 */
export async function joinHouseholdByCode(userId: string, code: string) {
  if (!code) throw new Error("Le code est vide.");

  const cleanCode = code.trim().toUpperCase();

  // 1. Trouver le household avec ce code
  const { data: households, error: searchError } = await supabase
    .from('households')
    .select('*')
    .eq('invitation_code', cleanCode)
    .limit(1);

  if (searchError) throw searchError;

  if (!households || households.length === 0) {
    throw new Error("Code invalide ou inexistant.");
  }

  const household = households[0];
  const householdId = household.id;

  // 2. Vérifier expiration
  if (
    household.invitation_expires_at &&
    dayjs().isAfter(dayjs(household.invitation_expires_at))
  ) {
    throw new Error("Ce code a expiré. Demandez-en un nouveau.");
  }

  // 3. Vérifier si déjà membre
  const currentMembers = household.members || [];
  if (currentMembers.includes(userId)) {
    return householdId;
  }

  // 4. Ajouter l'utilisateur au household
  const updatedMembers = [...currentMembers, userId];
  const { error: householdUpdateError } = await supabase
    .from('households')
    .update({ members: updatedMembers })
    .eq('id', householdId);

  if (householdUpdateError) throw householdUpdateError;

  // 5. Ajouter le household à l'utilisateur
  const { data: userData, error: userFetchError } = await supabase
    .from('users')
    .select('households')
    .eq('id', userId)
    .single();

  if (userFetchError) throw userFetchError;

  const updatedHouseholds = [...(userData?.households || []), householdId];

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ households: updatedHouseholds })
    .eq('id', userId);

  if (userUpdateError) throw userUpdateError;

  return householdId;
}

/**
 * Renomme un foyer
 */
export async function updateHouseholdName(
  householdId: string,
  newName: string,
) {
  const { error } = await supabase
    .from('households')
    .update({ name: newName })
    .eq('id', householdId);

  if (error) throw error;
}

/**
 * Quitter un foyer
 */
export async function leaveHousehold(userId: string, householdId: string) {
  // 1. Vérifier si c'est le foyer actif
  const { data: userData, error: userFetchError } = await supabase
    .from('users')
    .select('households, active_household_id')
    .eq('id', userId)
    .single();

  if (userFetchError) throw userFetchError;

  const isActiveHousehold = userData?.active_household_id === householdId;

  // 2. Retirer du household
  const { data: householdData, error: householdFetchError } = await supabase
    .from('households')
    .select('members')
    .eq('id', householdId)
    .single();

  if (householdFetchError) throw householdFetchError;

  const updatedMembers = (householdData?.members || []).filter(
    (m: string) => m !== userId
  );

  const { error: householdUpdateError } = await supabase
    .from('households')
    .update({ members: updatedMembers })
    .eq('id', householdId);

  if (householdUpdateError) throw householdUpdateError;

  // 3. Retirer de la liste de l'utilisateur
  const updatedHouseholds = (userData?.households || []).filter(
    (h: string) => h !== householdId
  );

  const updates: any = { households: updatedHouseholds };

  if (isActiveHousehold) {
    updates.active_household_id = userId;
  }

  const { error: userUpdateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (userUpdateError) throw userUpdateError;
}

/**
 * Crée les catégories par défaut
 */
export async function createDefaultCategories(householdId: string) {
  const categoriesToInsert = DEFAULT_CATEGORIES.map((category) => {
    const uniqueId = makeUniqueId(householdId, category.id);
    return {
      id: uniqueId,
      household_id: householdId,
      label: category.label,
      icon: category.icon,
      is_default: category.isDefault || false,
    };
  });

  const { error } = await supabase
    .from('categories')
    .insert(categoriesToInsert);

  if (error) throw error;
}

/**
 * Récupère toutes les catégories de revenus d'un foyer
 */
export async function getCategoriesRevenus(
  householdId: string,
): Promise<ICategorieRevenu[]> {
  try {
    const { data, error } = await supabase
      .from('categories_revenus')
      .select('*')
      .eq('household_id', householdId);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: extractDocId(row.id),
      label: row.label,
      icon: row.icon,
      isDefault: row.is_default,
    }));
  } catch (error) {
    console.error("Erreur getCategoriesRevenus:", error);
    throw error;
  }
}

/**
 * Ajoute une catégorie de revenu personnalisée
 */
export async function addCategorieRevenu(
  householdId: string,
  category: Omit<ICategorieRevenu, "id">,
): Promise<string> {
  try {
    const newCatId = generateId();
    const uniqueId = makeUniqueId(householdId, newCatId);

    const { error } = await supabase
      .from('categories_revenus')
      .insert({
        id: uniqueId,
        household_id: householdId,
        label: category.label,
        icon: category.icon,
        is_default: category.isDefault || false,
      });

    if (error) throw error;
    return newCatId;
  } catch (error) {
    console.error("Erreur addCategorieRevenu:", error);
    throw error;
  }
}

/**
 * Met à jour une catégorie de revenu
 */
export async function updateCategorieRevenu(
  householdId: string,
  categoryId: string,
  updates: Partial<Omit<ICategorieRevenu, "id">>,
) {
  try {
    const uniqueId = makeUniqueId(householdId, categoryId);
    const supabaseUpdates: any = {};

    if (updates.label !== undefined) supabaseUpdates.label = updates.label;
    if (updates.icon !== undefined) supabaseUpdates.icon = updates.icon;

    const { error } = await supabase
      .from('categories_revenus')
      .update(supabaseUpdates)
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur updateCategorieRevenu:", error);
    throw error;
  }
}

/**
 * Supprime une catégorie de revenu
 */
export async function deleteCategorieRevenu(
  householdId: string,
  categoryId: string,
) {
  try {
    const uniqueId = makeUniqueId(householdId, categoryId);

    const { error } = await supabase
      .from('categories_revenus')
      .delete()
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur deleteCategorieRevenu:", error);
    throw error;
  }
}

/**
 * Crée les catégories de revenus par défaut
 */
export async function createDefaultCategoriesRevenus(householdId: string) {
  const categoriesToInsert = DEFAULT_CATEGORIES_REVENUS.map((category) => {
    const uniqueId = makeUniqueId(householdId, category.id);
    return {
      id: uniqueId,
      household_id: householdId,
      label: category.label,
      icon: category.icon,
      is_default: category.isDefault || false,
    };
  });

  const { error } = await supabase
    .from('categories_revenus')
    .insert(categoriesToInsert);

  if (error) throw error;
}


/**
 * Récupère tous les revenus d'un foyer
 */
export async function getRevenus(
  householdId: string,
  moisAnnee?: string,
): Promise<IRevenu[]> {
  try {
    let query = supabase
      .from('revenus')
      .select('*')
      .eq('household_id', householdId);

    if (moisAnnee) {
      query = query.eq('mois_annee', moisAnnee);
    }

    const { data, error } = await query.order('date_reception', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: extractDocId(row.id),
      householdId: row.household_id,
      categorie: row.categorie,
      description: row.description,
      montant: row.montant,
      beneficiaire: row.beneficiaire,
      dateReception: row.date_reception,
      moisAnnee: row.mois_annee,
    }));
  } catch (error) {
    console.error("Erreur getRevenus:", error);
    throw error;
  }
}

/**
 * Ajoute un revenu
 */
export async function addRevenu(
  householdId: string,
  revenu: Omit<IRevenu, "id" | "householdId">,
): Promise<string> {
  try {
    const docId = generateId();
    const uniqueId = makeUniqueId(householdId, docId);

    const { error } = await supabase
      .from('revenus')
      .insert({
        id: uniqueId,
        household_id: householdId,
        categorie: revenu.categorie,
        description: revenu.description,
        montant: revenu.montant,
        beneficiaire: revenu.beneficiaire,
        date_reception: revenu.dateReception,
        mois_annee: revenu.moisAnnee,
      });

    if (error) throw error;
    return docId;
  } catch (error) {
    console.error("Erreur addRevenu:", error);
    throw error;
  }
}

/**
 * Met à jour un revenu
 */
export async function updateRevenu(
  householdId: string,
  revenuId: string,
  updates: Partial<Omit<IRevenu, "id" | "householdId">>,
) {
  try {
    const uniqueId = makeUniqueId(householdId, revenuId);
    const supabaseUpdates: any = {};

    if (updates.categorie !== undefined) supabaseUpdates.categorie = updates.categorie;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.montant !== undefined) supabaseUpdates.montant = updates.montant;
    if (updates.beneficiaire !== undefined) supabaseUpdates.beneficiaire = updates.beneficiaire;
    if (updates.dateReception !== undefined) supabaseUpdates.date_reception = updates.dateReception;
    if (updates.moisAnnee !== undefined) supabaseUpdates.mois_annee = updates.moisAnnee;
    if (updates.moisAnnee !== undefined) supabaseUpdates.mois_annee = updates.moisAnnee;

    const { error } = await supabase
      .from('revenus')
      .update(supabaseUpdates)
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur updateRevenu:", error);
    throw error;
  }
}

/**
 * Supprime un revenu
 */
export async function deleteRevenu(householdId: string, revenuId: string) {
  try {
    const uniqueId = makeUniqueId(householdId, revenuId);

    const { error } = await supabase
      .from('revenus')
      .delete()
      .eq('id', uniqueId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur deleteRevenu:", error);
    throw error;
  }
}
import { db } from "./config";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  addDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData,
  CollectionReference,
  getDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  limit,
} from "firebase/firestore";
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
} from "../../types";
import { DEFAULT_CATEGORIES } from "constants/categories";

const SUB_COLLECTIONS = {
  COMPTES_MENSUELS: "comptes_mensuels",
  CHARGES_FIXES: "charges_fixes",
  CHARGES: "charges",
  CATEGORIES: "categories",
  LOYER_CONFIG: "loyer_config",
};

// Fonction pour obtenir la référence de la sous-collection d'un foyer
function getCollectionRef(
  householdId: string,
  subCollection: string,
): CollectionReference<DocumentData> {
  return collection(db, "households", householdId, subCollection);
}

// Permet de mapper un document Firestore à l'interface TypeScript
const mapDocToType = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
  return {
    id: doc.id,
    ...doc.data(),
  } as T;
};

/**
 * Crée un profil utilisateur dans Firestore après l'inscription
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
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...data,
      id: uid,
    });

    await createDefaultCategories(uid);
  } catch (error) {
    console.error("Erreur lors de la création du profil utilisateur:", error);
    throw error;
  }
}

/**
 * Modifie les infos d'un utilisateur
 */
export async function updateUserInfo(uid: string, data: any) {
  const userRef = doc(db, "users", uid);
  const cleanData = { ...data };
  delete cleanData.id;
  delete cleanData.activeHouseholdId;
  delete cleanData.households;

  try {
    await updateDoc(userRef, cleanData);
  } catch (error) {
    throw error;
  }
}

/**
 * Supprime un utilisateur
 */
export async function deleteUserInfo(uid: string) {
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Erreur lors de la suppression du profil Firestore:", error);
    throw error;
  }
}

/**
 * Récupère tous les utilisateurs appartenant à un HouseholdId donné.
 */
export async function getHouseholdUsers(householdId: string): Promise<IUser[]> {
  try {
    const householdRef = doc(db, "households", householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists()) {
      return [];
    }

    const householdData = householdSnap.data();
    const memberIds = householdData.members || [];

    if (memberIds.length === 0) {
      return [];
    }

    const usersPromises = memberIds.map(async (uid: string) => {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists()
        ? mapDocToType<IUser>(userSnap as QueryDocumentSnapshot<DocumentData>)
        : null;
    });

    const users = await Promise.all(usersPromises);

    return users.filter((u): u is IUser => u !== null);
  } catch (error) {
    console.error("Erreur getHouseholdMembers:", error);
    throw error;
  }
}

/**
 * Récupère la configuration active du loyer
 */
export async function getLoyerConfig(
  householdId: string,
): Promise<ILoyerConfig | null> {
  const docRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.LOYER_CONFIG),
    "current",
  );
  const snap = await getDoc(docRef);

  return snap.exists()
    ? mapDocToType<ILoyerConfig>(snap as QueryDocumentSnapshot<DocumentData>)
    : null;
}

/**
 * Met à jour la configuration du loyer (toujours modifiable)
 */
export async function updateLoyerConfig(
  householdId: string,
  loyerTotal: number,
  apportsAPL: Record<string, number>,
  loyerPayeurUid: string,
): Promise<void> {
  const docRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.LOYER_CONFIG),
    "current",
  );

  await setDoc(docRef, {
    id: "current",
    loyerTotal,
    apportsAPL,
    loyerPayeurUid,
    dateModification: new Date().toISOString(),
  });
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

/**
 * Créer les données du compte mensuel.
 */
export async function createCompteMensuel(
  householdId: string,
  data: ICompteMensuel,
): Promise<void> {
  try {
    const docRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
      data.id,
    );
    await setDoc(docRef, data);
  } catch (error) {
    console.error("Erreur lors de la création du compte mensuel:", error);
    throw error;
  }
}

/**
 * Récupérer les données du compte mensuel pour un mois donné.
 */
export async function getCompteMensuel(
  householdId: string,
  moisAnnee: string,
): Promise<ICompteMensuel | null> {
  const docRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
    moisAnnee,
  );
  const snap = await getDoc(docRef);

  return snap.exists()
    ? mapDocToType<ICompteMensuel>(snap as QueryDocumentSnapshot<DocumentData>)
    : null;
}

/**
 * Met à jour les montants Loyer et APL d'un compte mensuel existant via son ID.
 */
export async function updateLoyerApl(
  householdId: string,
  compteDocId: string,
  loyerTotal: number,
  apportsAPL: Record<string, number>,
  loyerPayeurUid: string,
) {
  const compteRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
    compteDocId,
  );
  await updateDoc(compteRef, { loyerTotal, apportsAPL, loyerPayeurUid });
}

/**
 * Modifie un mois comme 'finalisé' dans la base.
 */
export async function setMoisFinalise(
  householdId: string,
  compteDocId: string,
) {
  const compteRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
    compteDocId,
  );
  await updateDoc(compteRef, {
    statut: "finalisé",
  });
}

/**
 * Récupère les templates des charges fixes (Élec, Gaz, Internet...).
 */
export async function getChargesFixesConfigs(
  householdId: string,
): Promise<IChargeFixeTemplate[]> {
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES_FIXES,
  );
  const snapshot = await getDocs(chargesCollection);
  return snapshot.docs.map((doc) => mapDocToType<IChargeFixeTemplate>(doc));
}

/**
 * Ajoute un nouveau template de charge fixe dans la base.
 */
export async function addChargeFixeConfig(
  householdId: string,
  charge: Omit<IChargeFixeTemplate, "id" | "householdId">,
): Promise<string> {
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES_FIXES,
  );
  const docRef = await addDoc(chargesCollection, {
    ...charge,
    type: "fixe",
    householdId,
  });
  return docRef.id;
}

/**
 * Met à jour n'importe quel paramètre d'un template de charge fixe
 */
export async function updateChargeFixeConfig(
  householdId: string,
  chargeId: string,
  updates: Partial<Omit<IChargeFixeTemplate, "id">>,
) {
  const chargeRef = doc(
    db,
    "households",
    householdId,
    SUB_COLLECTIONS.CHARGES_FIXES,
    chargeId,
  );

  await updateDoc(chargeRef, {
    ...updates,
  });
}

/**
 * Supprime une charge fixe via son ID de document.
 */
export async function deleteChargeFixeConfig(
  householdId: string,
  chargeId: string,
) {
  const chargeRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.CHARGES_FIXES),
    chargeId,
  );
  await deleteDoc(chargeRef);
}

/**
 * Récupère toutes les charges (selon le type fixe ou variable) d'un foyer
 */
export async function getChargesByType(
  householdId: string,
  type: "fixe" | "variable",
): Promise<ICharge[]> {
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES,
  );
  const q = query(chargesCollection, where("type", "==", type));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => mapDocToType<ICharge>(doc));
}

/**
 * Récupère toutes les charges d'un foyer
 */
export async function getAllCharges(
  householdId: string,
): Promise<ICharge[]> {
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES,
  );
  const snapshot = await getDocs(chargesCollection);

  return snapshot.docs.map((doc) =>
    mapDocToType<ICharge>(doc),
  );
}

/**
 * Récupère toutes les charges d'un type précis où l'utilisateur est bénéficiaire
 * à travers plusieurs foyers (solo + partagé)
 */
export async function getSoloChargesByType(
  householdIds: string[],
  userId: string,
  type: "fixe" | "variable",
): Promise<ICharge[]> {
  let allCharges: ICharge[] = [];

  for (const id of householdIds) {
    const q = query(
      getCollectionRef(id, SUB_COLLECTIONS.CHARGES),
      where("type", "==", type),
      where("beneficiaires", "array-contains", userId),
    );

    const snap = await getDocs(q);
    const charges = snap.docs.map((doc) => mapDocToType<ICharge>(doc));

    allCharges = [...allCharges, ...charges];
  }

  return allCharges.sort((a, b) => {
    const dateA = (a as any).dateStatistiques;
    const dateB = (b as any).dateStatistiques;
    return dateB.localeCompare(dateA);
  });
}

/**
 * Ajoute une nouvelle charge dans la base.
 */
export async function addCharge(
  householdId: string,
  charge: Omit<ICharge, "id" | "householdId">,
) {
  const depensesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES,
  );

  const chargeComplete = {
    ...charge,
    householdId,
    dateCreation: new Date().toISOString(),
  };

  const docRef = await addDoc(depensesCollection, chargeComplete);

  const householdRef = doc(db, "households", householdId);
  const householdSnap = await getDoc(householdRef);

  if (!householdSnap.exists()) {
    console.warn("Foyer introuvable");
    return docRef.id;
  }

  try {
    const categoryId = charge.categorie;
    const catRef = doc(db, "households", householdId, "categories", categoryId);
    const catSnap = await getDoc(catRef);

    if (!catSnap.exists()) {
      console.warn(
        `Catégorie ${charge.categorie} introuvable, propagation annulée`,
      );
      return docRef.id;
    }

    const categoryData = catSnap.data();

    const householdMembers = householdSnap.data().members || [];

    const realUserBeneficiaires = charge.beneficiaires.filter(
      (uid) => householdMembers.includes(uid) && uid !== householdId,
    );

    if (realUserBeneficiaires.length === 0) {
      console.log("Aucun bénéficiaire à propager");
      return docRef.id;
    }

    const batch = writeBatch(db);
    let propagationCount = 0;

    for (const userId of realUserBeneficiaires) {
      try {
        const soloCatRef = doc(
          db,
          "households",
          userId,
          "categories",
          charge.categorie,
        );

        const existingCat = await getDoc(soloCatRef);

        if (!existingCat.exists()) {
          batch.set(soloCatRef, categoryData, { merge: true });
          propagationCount++;
          console.log(`Catégorie propagée au foyer solo de ${userId}`);
        } else {
          console.log(
            `Catégorie déjà existante dans le foyer solo de ${userId}`,
          );
        }
      } catch (error) {
        console.warn(
          `Impossible de propager la catégorie au foyer solo ${userId}:`,
          error,
        );
      }
    }

    if (propagationCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
  }
  return docRef.id;
}

/**
 * Met à jour une charge variable via son ID.
 */
export async function updateCharge(
  householdId: string,
  chargeId: string,
  updateData: Partial<Omit<ICharge, "id" | "householdId" | "moisAnnee">>,
) {
  try {
    const chargeRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CHARGES),
      chargeId,
    );
    await updateDoc(chargeRef, {
      ...updateData,
    });
  } catch (error) {
    console.error("Erreur updateCharge:", error);
    throw error;
  }
}

/**
 * Supprime une charge variable via son ID.
 */
export async function deleteCharge(householdId: string, chargeId: string) {
  try {
    const chargeRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CHARGES),
      chargeId,
    );
    await deleteDoc(chargeRef);
  } catch (error) {
    console.error("Erreur deleteCharge:", error);
    throw error;
  }
}

/**
 * Ajoute une charge variable de regularisation pour le solde variable du mois.
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

/**
 * Modifier le compte mensuel dans le cas d'une régularisation de dettes.
 */
export async function updateRegularisationDettes(
  householdId: string,
  moisAnnee: string,
  dettes: IDette[],
  chargesFixesSnapshot: IChargeFixeSnapshot[],
): Promise<void> {
  try {
    const docRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
      moisAnnee,
    );
    await updateDoc(docRef, {
      dettes: dettes,
      chargesFixesSnapshot: chargesFixesSnapshot,
    });
  } catch (error) {
    console.error("Erreur updateRegularisationDettes:", error);
    throw error;
  }
}

/**
 * Récupère tous les comptes mensuels dont le statut est 'finalisé' (historique).
 */
export async function getHistoryMonths(
  householdId: string,
): Promise<ICompteMensuel[]> {
  const comptesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.COMPTES_MENSUELS,
  );

  const q = query(comptesCollection, where("statut", "==", "finalisé"));

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => mapDocToType<ICompteMensuel>(doc));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des comptes mensuels:",
      error,
    );
    throw error;
  }
}

/**
 * Récupère toutes les catégories personnalisées d'un foyer.
 */
export async function getHouseholdCategories(
  householdId: string,
): Promise<ICategorie[]> {
  const categoriesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CATEGORIES,
  );

  try {
    const snapshot = await getDocs(categoriesCollection);
    return snapshot.docs.map((doc) => mapDocToType<ICategorie>(doc));
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    throw error;
  }
}

export async function addCategory(
  householdId: string,
  category: Omit<ICategorie, "id">,
) {
  try {
    const batch = writeBatch(db);
    const categorieCollection = getCollectionRef(
      householdId,
      SUB_COLLECTIONS.CATEGORIES,
    );
    const newCatRef = doc(categorieCollection);
    batch.set(newCatRef, category);

    const householdRef = doc(db, "households", householdId);
    const householdSnap = await getDoc(householdRef);

    if (householdSnap.exists()) {
      const members = householdSnap.data().members || [];

      members.forEach((uid: string) => {
        if (uid !== householdId) {
          const soloCatRef = doc(
            db,
            "households",
            uid,
            "categories",
            newCatRef.id,
          );
          batch.set(soloCatRef, category, { merge: true });
        }
      });
    }

    await batch.commit();
    return newCatRef.id;
  } catch (error) {
    console.error("Erreur addCategory avec propagation:", error);
    throw error;
  }
}

export async function updateCategory(
  householdId: string,
  categoryId: string,
  updateData: Partial<ICategorie>,
) {
  try {
    const batch = writeBatch(db);
    const categoryRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CATEGORIES),
      categoryId,
    );
    batch.update(categoryRef, updateData);
    const householdRef = doc(db, "households", householdId);
    const householdSnap = await getDoc(householdRef);

    if (householdSnap.exists()) {
      const members = householdSnap.data().members || [];

      members.forEach((uid: string) => {
        if (uid !== householdId) {
          const soloCatRef = doc(
            db,
            "households",
            uid,
            "categories",
            categoryId,
          );
          batch.set(soloCatRef, updateData, { merge: true });
        }
      });
    }

    await batch.commit();
  } catch (error) {
    console.error("Erreur updateCategory avec propagation:", error);
    throw error;
  }
}

export async function deleteCategory(householdId: string, categoryId: string) {
  try {
    const categoryRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CATEGORIES),
      categoryId,
    );
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error("Erreur deleteCategory:", error);
    throw error;
  }
}

export async function migrateChargesOnDelete(
  householdId: string,
  oldCategoryId: string,
  defaultCategoryId: string,
) {
  const batch = writeBatch(db);
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES,
  );
  const q = query(chargesCollection, where("categorie", "==", oldCategoryId));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    batch.update(doc.ref, { categorie: defaultCategoryId });
  });
  await batch.commit();
}

export async function switchActiveHousehold(
  userId: string,
  newHouseholdId: string,
) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { activeHouseholdId: newHouseholdId });
  } catch (error) {
    console.error("Erreur switch household:", error);
    throw error;
  }
}

/**
 * Crée un nouveau foyer partagé et l'ajoute à la liste de l'utilisateur
 */
export async function createHousehold(userId: string, name: string) {
  try {
    const batch = writeBatch(db);

    const householdRef = doc(collection(db, "households"));
    batch.set(householdRef, {
      name,
      createdAt: new Date().toISOString(),
      members: [userId],
    });

    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      households: arrayUnion(householdRef.id),
    });

    await batch.commit();

    await createDefaultCategories(householdRef.id);
    return householdRef.id;
  } catch (error) {
    console.error("Erreur createHousehold:", error);
    throw error;
  }
}

/**
 * Génère ou récupère un code d'invitation directement dans le foyer
 */
export async function generateInvitationCode(householdId: string) {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = dayjs().add(24, "hours").toISOString();

    const householdRef = doc(db, "households", householdId);

    await updateDoc(householdRef, {
      invitationCode: code,
      invitationExpiresAt: expiresAt,
    });

    return code;
  } catch (error) {
    console.error("Erreur lors de la génération du code:", error);
    throw error;
  }
}

/**
 * Rejoint un foyer en cherchant le document qui possède le code actif
 */
export async function joinHouseholdByCode(userId: string, code: string) {
  if (!code) throw new Error("Le code est vide.");

  const cleanCode = code.trim().toUpperCase();
  const householdsRef = collection(db, "households");

  const q = query(
    householdsRef,
    where("invitationCode", "==", cleanCode),
    limit(1),
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Code invalide ou inexistant.");
  }

  const householdDoc = querySnapshot.docs[0];
  const householdData = householdDoc.data();
  const householdId = householdDoc.id;

  if (
    householdData.invitationExpiresAt &&
    dayjs().isAfter(dayjs(householdData.invitationExpiresAt))
  ) {
    throw new Error("Ce code a expiré. Demandez-en un nouveau.");
  }

  const currentMembers = householdData.members || [];
  if (currentMembers.includes(userId)) {
    return householdId;
  }

  const batch = writeBatch(db);

  batch.update(householdDoc.ref, {
    members: arrayUnion(userId),
  });

  const userRef = doc(db, "users", userId);
  batch.update(userRef, {
    households: arrayUnion(householdId),
  });

  await batch.commit();
  return householdId;
}

/**
 * Renommer un foyer
 */
export async function updateHouseholdName(
  householdId: string,
  newName: string,
) {
  const householdRef = doc(db, "households", householdId);
  await updateDoc(householdRef, { name: newName });
}

/**
 * Quitter un foyer
 */
export async function leaveHousehold(userId: string, householdId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const isActiveHousehold =
    userSnap.exists() && userSnap.data().activeHouseholdId === householdId;

  const batch = writeBatch(db);

  const householdRef = doc(db, "households", householdId);
  batch.update(householdRef, { members: arrayRemove(userId) });

  const updateData: any = { households: arrayRemove(householdId) };
  if (isActiveHousehold) {
    updateData.activeHouseholdId = userId;
  }

  batch.update(userRef, updateData);

  await batch.commit();
}

export async function createDefaultCategories(householdId: string) {
  const categoriesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CATEGORIES,
  );

  const batch = writeBatch(db);

  DEFAULT_CATEGORIES.forEach((category) => {
    const { id, ...categoryData } = category;
    const categoryRef = doc(categoriesCollection, id);

    batch.set(categoryRef, categoryData);
  });

  await batch.commit();
}

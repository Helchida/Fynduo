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
  IChargeFixe,
  ICompteMensuel,
  IChargeVariable,
  IChargeFixeSnapshot,
  IDette,
  IUser,
  ICategorie,
} from "../../types";
import { DEFAULT_CATEGORIES } from "constants/categories";

const SUB_COLLECTIONS = {
  COMPTES_MENSUELS: "comptes_mensuels",
  CHARGES_FIXES: "charges_fixes",
  CHARGES_VARIABLES: "charges_variables",
  CATEGORIES: "categories",
};

// Fonction pour obtenir la référence de la sous-collection d'un foyer
function getCollectionRef(
  householdId: string,
  subCollection: string
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
  }
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
      return userSnap.exists() ? mapDocToType<IUser>(userSnap as QueryDocumentSnapshot<DocumentData>) : null;
    });
    
    const users = await Promise.all(usersPromises);
    
    return users.filter((u): u is IUser => u !== null);
  } catch (error) {
    console.error("Erreur getHouseholdMembers:", error);
    throw error;
  }
}

/**
 * Créer les données du compte mensuel.
 */
export async function createCompteMensuel(
  householdId: string,
  data: ICompteMensuel
): Promise<void> {
  try {
    const docRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
      data.id
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
  moisAnnee: string
): Promise<ICompteMensuel | null> {
  const docRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
    moisAnnee
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
  loyerPayeurUid: string
) {
  const compteRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
    compteDocId
  );
  await updateDoc(compteRef, { loyerTotal, apportsAPL, loyerPayeurUid });
}

/**
 * Modifie un mois comme 'finalisé' dans la base.
 */
export async function setMoisFinalise(
  householdId: string,
  compteDocId: string
) {
  const compteRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
    compteDocId
  );
  await updateDoc(compteRef, {
    statut: "finalisé",
  });
}

/**
 * Récupère toutes les charges fixes (Élec, Gaz, Internet...).
 */
export async function getChargesFixes(
  householdId: string
): Promise<IChargeFixe[]> {
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES_FIXES
  );
  const snapshot = await getDocs(chargesCollection);

  return snapshot.docs.map((doc) => mapDocToType<IChargeFixe>(doc));
}

/**
 * Met à jour le montant d'une charge fixe via son ID de document.
 */
export async function updateChargeFixeAmount(
  householdId: string,
  chargeId: string,
  newAmount: number
) {
  const chargeRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.CHARGES_FIXES),
    chargeId
  );
  await updateDoc(chargeRef, {
    montantMensuel: newAmount,
    dateMiseAJour: new Date().toISOString(),
  });
}

/**
 * Ajoute une nouvelle charge fixe dans la base.
 */
export async function addChargeFixe(
  householdId: string,
  charge: Omit<IChargeFixe, "id" | "householdId">
): Promise<string> {
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES_FIXES
  );
  const docRef = await addDoc(chargesCollection, {
    ...charge,
    householdId,
    dateCreation: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Met à jour le payeur d'une charge fixe via son ID.
 */
export const updateChargeFixePayeur = async (
  householdId: string,
  chargeId: string,
  newPayeurId: string
) => {
  const chargeRef = doc(
    db,
    "households",
    householdId,
    "charges_fixes",
    chargeId
  );
  await updateDoc(chargeRef, {
    payeur: newPayeurId,
  });
};

/**
 * Supprime une charge fixe via son ID de document.
 */
export async function deleteChargeFixe(householdId: string, chargeId: string) {
  const chargeRef = doc(
    getCollectionRef(householdId, SUB_COLLECTIONS.CHARGES_FIXES),
    chargeId
  );
  await deleteDoc(chargeRef);
}

/**
 * Récupère toutes les charges variables (Courses, restaurants, loisirs...)
 */
export async function getChargesVariables(
  householdId: string
): Promise<IChargeVariable[]> {
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES_VARIABLES
  );
  const snapshot = await getDocs(chargesCollection);

  return snapshot.docs.map((doc) => mapDocToType<IChargeVariable>(doc));
}

/**
 * Ajoute une nouvelle charge variable dans la base.
 */
export async function addChargeVariable(
  householdId: string,
  depense: Omit<IChargeVariable, "id" | "householdId">
) {
  const depensesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES_VARIABLES
  );

  const docRef = await addDoc(depensesCollection, depense);
  return docRef.id;
}

/**
 * Met à jour une charge variable via son ID.
 */
export async function updateChargeVariable(
  householdId: string,
  chargeId: string,
  updateData: Partial<Omit<IChargeVariable, "id" | "householdId" | "moisAnnee">>
) {
  try {
    const chargeRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CHARGES_VARIABLES),
      chargeId
    );
    await updateDoc(chargeRef, {
      ...updateData,
      dateMiseAJour: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur updateChargeVariable:", error);
    throw error;
  }
}

/**
 * Supprime une charge variable via son ID.
 */
export async function deleteChargeVariable(
  householdId: string,
  chargeId: string
) {
  try {
    const chargeRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CHARGES_VARIABLES),
      chargeId
    );
    await deleteDoc(chargeRef);
  } catch (error) {
    console.error("Erreur deleteChargeVariable:", error);
    throw error;
  }
}

/**
 * Ajoute une charge variable de regularisation pour le solde variable du mois.
 */
export async function addChargeVariableRegularisation(
  householdId: string,
  moisAnnee: string,
  dettes: IDette[]
) {
  const dateRegul = dayjs().toISOString();
  const dettesPositives = dettes.filter((d) => d.montant > 0);
  for (const dette of dettesPositives) {
    await addChargeVariable(householdId, {
      description: "Régularisation Trésorerie",
      montantTotal: dette.montant,
      payeur: dette.debiteurUid,
      beneficiaires: [dette.creancierUid],
      dateStatistiques: dateRegul,
      dateComptes: dateRegul,
      moisAnnee: moisAnnee,
      categorie: "Remboursement",
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
  chargesFixesSnapshot: IChargeFixeSnapshot[]
): Promise<void> {
  try {
    const docRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.COMPTES_MENSUELS),
      moisAnnee
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
  householdId: string
): Promise<ICompteMensuel[]> {
  const comptesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.COMPTES_MENSUELS
  );

  const q = query(comptesCollection, where("statut", "==", "finalisé"));

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => mapDocToType<ICompteMensuel>(doc));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des comptes mensuels:",
      error
    );
    throw error;
  }
}

/**
 * Récupère toutes les catégories personnalisées d'un foyer.
 */
export async function getHouseholdCategories(
  householdId: string
): Promise<ICategorie[]> {
  const categoriesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CATEGORIES
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
  category: Omit<ICategorie, "id">
) {
  const categorieCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CATEGORIES
  );
  const docRef = await addDoc(categorieCollection, category);
  return docRef.id;
}

export async function updateCategory(
  householdId: string,
  categoryId: string,
  updateData: Partial<ICategorie>
) {
  try {
    const categoryRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CATEGORIES),
      categoryId
    );
    await updateDoc(categoryRef, {
      ...updateData,
    });
  } catch (error) {
    console.error("Erreur updateCategory:", error);
    throw error;
  }
}

export async function deleteCategory(householdId: string, categoryId: string) {
  try {
    const categoryRef = doc(
      getCollectionRef(householdId, SUB_COLLECTIONS.CATEGORIES),
      categoryId
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
  defaultCategoryId: string
) {
  const batch = writeBatch(db);
  const chargesCollection = getCollectionRef(
    householdId,
    SUB_COLLECTIONS.CHARGES_VARIABLES
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
  newHouseholdId: string
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
    limit(1)
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
  newName: string
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
    SUB_COLLECTIONS.CATEGORIES
  );

  const batch = writeBatch(db);

  DEFAULT_CATEGORIES.forEach((category) => {
    const categoryRef = doc(categoriesCollection);
    batch.set(categoryRef, category);
  });

  await batch.commit();
}
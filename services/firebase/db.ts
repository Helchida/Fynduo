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
} from "firebase/firestore";
import dayjs from "dayjs";
import {
  IChargeFixe,
  ICompteMensuel,
  IChargeVariable,
  IChargeFixeSnapshot,
  IDette,
  IUser,
} from "../../types";

const SUB_COLLECTIONS = {
  COMPTES_MENSUELS: "comptes_mensuels",
  CHARGES_FIXES: "charges_fixes",
  CHARGES_VARIABLES: "charges_variables",
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
 * Récupère tous les utilisateurs appartenant à un HouseholdId donné.
 */
export async function getHouseholdUsers(householdId: string): Promise<IUser[]> {
  const usersCollection = collection(db, "users");
  const q = query(usersCollection, where("householdId", "==", householdId));

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => mapDocToType<IUser>(doc));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs du foyer:",
      error
    );
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
  updateData: Partial<
    Omit<IChargeVariable, "id" | "householdId" | "moisAnnee" | "date">
  >
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
      payeur: dette.creancierUid,
      beneficiaires: [dette.debiteurUid],
      date: dateRegul,
      moisAnnee: moisAnnee,
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

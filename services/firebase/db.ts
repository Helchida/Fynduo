import { db } from './config'; 
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
    DocumentData
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { IChargeFixe, ICompteMensuel, IChargeVariable, Colocataire, IChargeFixeSnapshot } from '../../types';


const COLLECTIONS = {
    COMPTES_MENSUELS: 'comptes_mensuels',
    CHARGES_FIXES: 'charges_fixes',
    CHARGES_VARIABLES: 'charges_variables',
};


// Permet de mapper un document Firestore à l'interface TypeScript
const mapDocToType = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
    return {
        id: doc.id,
        ...doc.data()
    } as T;
};

/**
 * Créer les données du compte mensuel.
 */
export async function createCompteMensuel(data: ICompteMensuel): Promise<void> {
    try {
        const docRef = doc(db, COLLECTIONS.COMPTES_MENSUELS, data.id); 
        await setDoc(docRef, data); 
        
        console.log(`[DB] Document mensuel créé avec succès : ${data.id}`);
    } catch (error) {
        console.error("Erreur lors de la création du compte mensuel:", error);
        throw error;
    }
}

/**
 * Récupérer les données du compte mensuel pour un mois donné.
 */
export async function getCompteMensuel(moisAnnee: string): Promise<ICompteMensuel | null> {
    const comptesCollection = collection(db, COLLECTIONS.COMPTES_MENSUELS);
    const q = query(comptesCollection, where('moisAnnee', '==', moisAnnee));

    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 
        ? mapDocToType<ICompteMensuel>(snapshot.docs[0]) 
        : null;
}


/**
 * Récupère toutes les charges fixes (Élec, Gaz, Internet...).
 */
export async function getChargesFixes(): Promise<IChargeFixe[]> {
    const chargesCollection = collection(db, COLLECTIONS.CHARGES_FIXES); 
    const snapshot = await getDocs(chargesCollection);
    
    return snapshot.docs.map(doc => mapDocToType<IChargeFixe>(doc));
}


/**
 * Récupère toutes les charges variables (Courses, restaurants, loisirs...) pour un mois donné.
 */
export async function getChargesVariables(moisAnnee: string): Promise<IChargeVariable[]> {
    const depensesCollection = collection(db, COLLECTIONS.CHARGES_VARIABLES);
    const q = query(depensesCollection, where('moisAnnee', '==', moisAnnee)); 
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => mapDocToType<IChargeVariable>(doc));
}


/**
 * Met à jour le montant d'une charge fixe via son ID de document.
 */
export async function updateChargeFixeAmount(chargeId: string, newAmount: number) {
    const chargeRef = doc(db, COLLECTIONS.CHARGES_FIXES, chargeId);
    await updateDoc(chargeRef, { 
        montantMensuel: newAmount, 
        dateMiseAJour: new Date().toISOString() 
    });
}

/**
 * Ajoute une nouvelle charge fixe dans la base.
 */
export async function addChargeFixe(charge: Omit<IChargeFixe, 'id'>): Promise<string> {
    const chargesCollection = collection(db, COLLECTIONS.CHARGES_FIXES);
    const docRef = await addDoc(chargesCollection, {
        ...charge,
        dateCreation: new Date().toISOString()
    });
    return docRef.id;
}

/**
 * Supprime une charge fixe via son ID de document.
 */
export async function deleteChargeFixe(chargeId: string) {
    const chargeRef = doc(db, COLLECTIONS.CHARGES_FIXES, chargeId);
    await deleteDoc(chargeRef);
}


/**
 * Met à jour les montants Loyer et APL d'un compte mensuel existant via son ID.
 */
export async function updateLoyerApl(compteDocId: string, loyerTotal: number, aplMorgan: number, aplJuliette: number) {
    const compteRef = doc(db, COLLECTIONS.COMPTES_MENSUELS, compteDocId);
    await updateDoc(compteRef, { loyerTotal, aplMorgan, aplJuliette });
}

/**
 * Ajoute une nouvelle charge variable dans la base.
 */
export async function addChargeVariable(depense: Omit<IChargeVariable, 'id'>) {
    const depensesCollection = collection(db, COLLECTIONS.CHARGES_VARIABLES);
    
    const docRef = await addDoc(depensesCollection, {
        ...depense, 
    });
    return docRef.id;
}


/**
 * Modifie un mois comme 'finalisé' dans la base.
 */
export async function setMoisFinalise(compteDocId: string) {
    const compteRef = doc(db, COLLECTIONS.COMPTES_MENSUELS, compteDocId);
    await updateDoc(compteRef, { 
        statut: 'finalisé' 
    });
}

/**
 * Ajoute une charge variable de regularisation pour le solde variable du mois.
 */
export async function addChargeVariableRegularisation(
    moisAnnee: string,
    detteMorganToJuliette: number, 
    detteJulietteToMorgan: number
) {
    const dateRegul = dayjs().toISOString();

    const transactions: { payeur: Colocataire, beneficiaire: Colocataire, montant: number, description: string, moisAnnee: string }[] = [];

    // 1. Morgan doit à Juliette (Juliette est créancière/payeur)
    if (detteMorganToJuliette > 0) {
        transactions.push({
            montant: detteMorganToJuliette,
            payeur: 'Juliette',
            beneficiaire: 'Morgan',
            description: `Régularisation Trésorerie: Morgan doit à Juliette`,
            moisAnnee,
        });
    }
    
    // 2. Juliette doit à Morgan (Morgan est créancier/payeur)
    if (detteJulietteToMorgan > 0) {
        transactions.push({
            montant: detteJulietteToMorgan,
            payeur: 'Morgan',
            beneficiaire: 'Juliette',
            description: `Régularisation Trésorerie: Juliette doit à Morgan`,
            moisAnnee,
        });
    }

    for (const transaction of transactions) {
         await addChargeVariable({
            description: transaction.description,
            montantTotal: transaction.montant,
            payeur: transaction.payeur,
            beneficiaires: [transaction.beneficiaire],
            date: dateRegul,
            moisAnnee: transaction.moisAnnee,
        });
    }
    
    return Promise.resolve();
}

/**
 * Modifier le compte mensuel dans le cas d'une régularisation de dettes.
 */
export async function updateRegularisationDettes(
    moisAnnee: string, 
    detteMorganToJuliette: number, 
    detteJulietteToMorgan: number,
    chargesFixesSnapshot: IChargeFixeSnapshot[]
): Promise<void> {
    try {
        const docRef = doc(db, COLLECTIONS.COMPTES_MENSUELS, moisAnnee); 
        await updateDoc(docRef, {
            detteMorganToJuliette: detteMorganToJuliette,
            detteJulietteToMorgan: detteJulietteToMorgan,
            chargesFixesSnapshot: chargesFixesSnapshot,
        });

        console.log(`[DB] Dettes de régularisation mises à jour pour le mois : ${moisAnnee}`);
    } catch (error) {
        console.error("Erreur updateRegularisationDettes:", error);
        throw error;
    }
}

/**
 * Récupère tous les comptes mensuels dont le statut est 'finalisé' (historique).
 */
export async function getHistoryMonths(): Promise<ICompteMensuel[]> {
    const comptesCollection = collection(db, COLLECTIONS.COMPTES_MENSUELS);
    
    const q = query(comptesCollection, where('statut', '==', 'finalisé'));

    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => mapDocToType<ICompteMensuel>(doc));
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique des comptes mensuels:", error);
        throw error;
    }
}
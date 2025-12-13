import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

interface FirestoreDocument {
    id: string; // ID du document dans la base de données
}

// UTILISATEURS ET AUTH

export interface IUser extends FirestoreDocument {
    displayName: string;
    householdId: string;
    email: string;
}

// DONNÉES FINANCIÈRES
// 1. Charges fixes récurrentes (Electricité, Gaz, Internet...)
export interface IChargeFixe extends FirestoreDocument {
    nom: string;
    montantMensuel: number;
    payeur: string;
    dateMiseAJour?: string;
    dateCreation?: string;
    moisAnnee?: string;
    householdId: string;
}


export interface IChargeFixeSnapshot {
    nom: string;
    montantMensuel: number;
    payeur: string;
}

// 2. Trésorerie (Dépenses occasionnelles : courses, resto, loisirs...)
export interface IChargeVariable extends FirestoreDocument {
    description: string;
    montantTotal: number;
    payeur: string;
    beneficiaires: string[];
    date: string;
    moisAnnee: string;
    householdId: string;
    
}

// 3. Données du mois (Loyer et APL + Régularisation)
export type StatutMois = 'ouvert' | 'finalisé';

export interface IDette {
    debiteurUid: string;
    creancierUid: string;
    montant: number;
}

export interface ICompteMensuel extends FirestoreDocument {
    moisAnnee: string;
    loyerTotal: number;
    loyerPayeurUid: string;
    apportsAPL: Record<string, number>;
    statut: StatutMois;
    dettes: IDette[];
    dateCloture?: string | null;
    chargesFixesSnapshot?: IChargeFixe[];
}

// NAVIGATION TYPES 
export type RootStackParamList = {
    Home: undefined;
    Loyer: undefined;
    ChargesFixes: undefined;
    ChargesVariables: undefined;
    Regulation: undefined;
    SummaryRegulation: undefined;
    Login: undefined;
    History: undefined;
    HistoryDetail: { moisAnnee: string };
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootStackRouteProp<RouteName extends keyof RootStackParamList> = RouteProp<RootStackParamList, RouteName>;
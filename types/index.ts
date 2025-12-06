import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

interface FirestoreDocument {
    id: string; // ID du document dans la base de données
}

// UTILISATEURS ET AUTH
export type Colocataire = 'Morgan' | 'Juliette';

export interface IUser extends FirestoreDocument {
    nom: Colocataire;
}

// DONNÉES FINANCIÈRES
// 1. Charges fixes récurrentes (Electricité, Gaz, Internet...)
export interface IChargeFixe extends FirestoreDocument {
    nom: string;
    montantMensuel: number;
    payeur: Colocataire;
    dateMiseAJour?: string;
    dateCreation?: string;
    moisAnnee?: string;
}

// 2. Trésorerie (Dépenses occasionnelles : courses, resto, loisirs...)
export interface IChargeVariable extends FirestoreDocument {
    description: string;
    montantTotal: number;
    payeur: Colocataire;
    beneficiaires: Colocataire[];
    date: string;
    moisAnnee: string;
    
}

// 3. Données du mois (Loyer et APL + Régularisation)
export type StatutMois = 'ouvert' | 'finalisé';

export interface ICompteMensuel extends FirestoreDocument {
    moisAnnee: string;
    loyerTotal: number;
    aplMorgan: number;
    aplJuliette: number;
    statut: StatutMois;
    detteMorganToJuliette?: number;
    detteJulietteToMorgan?: number;
    dateCloture?: string | null;
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
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootStackRouteProp<RouteName extends keyof RootStackParamList> = RouteProp<RootStackParamList, RouteName>;
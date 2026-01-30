import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

interface FirestoreDocument {
  id: string; // ID du document dans la base de données
}

// UTILISATEURS ET AUTH

export interface IUser extends FirestoreDocument {
  displayName: string;
  email: string;
  households: string[];
  activeHouseholdId: string;
}

export interface LoginAttempt {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
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

export interface ChargeFixeForm extends IChargeFixe {
  montantForm: string;
  isNew?: boolean;
}

export interface IChargeFixeSnapshot {
  nom: string;
  montantMensuel: number;
  payeur: string;
}

export type CategoryType =
  | "Alimentation"
  | "Logement"
  | "Transport"
  | "Santé"
  | "Loisirs"
  | "Remboursement"
  | "Autre";

// 2. Trésorerie (Dépenses occasionnelles : courses, resto, loisirs...)
export interface IChargeVariable extends FirestoreDocument {
  description: string;
  montantTotal: number;
  payeur: string;
  beneficiaires: string[];
  dateStatistiques: string;
  dateComptes: string;
  moisAnnee: string;
  categorie: ICategorie["id"];
  householdId: string;
}

// 3. Données du mois (Loyer et APL + Régularisation)
export type StatutMois = "ouvert" | "finalisé";

export interface IDette {
  debiteurUid: string;
  creancierUid: string;
  montant: number;
}

export interface ILoyerConfig extends FirestoreDocument {
  loyerTotal: number;
  apportsAPL: Record<string, number>;
  loyerPayeurUid: string;
  dateModification: string;
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

export interface IResultatsCalcul {
  detteLoyer: number;
  detteChargesFixes: number;
  detteChargesVariables: number;
  totalChargesFixes: number;
  soldeFinal: number;
  debiteur: string | null;
}

export interface IReglementData {
  loyerTotal: number;
  apportsAPL: Record<string, number>;
  dettes: IDette[];
  loyerPayeurUid: string;
  chargesFixesSnapshot?: IChargeFixeSnapshot[];
}

export interface IHistoricalData {
  compte: ICompteMensuel;
  chargesVariables: IChargeVariable[];
}

export interface ICategorie extends FirestoreDocument {
  label: string;
  icon: string;
  isDefault: boolean;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type StatPeriod = "mois" | "annee" | "tout";

export interface StatDataItem {
  categoryId: string;
  montant: number;
  label: string;
  icon: string;
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
  Register: undefined;
  EmailVerification: undefined;
  UserSettings: undefined;
  Households: undefined;
  History: undefined;
  Stats: undefined;
  HistoryDetail: { moisAnnee: string };
  ChargeVariableDetail: { chargeId: string; description: string };
};

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type RootStackRouteProp<RouteName extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, RouteName>;

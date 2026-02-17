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

export type CategoryType =
  | "Alimentation"
  | "Logement"
  | "Transport"
  | "Santé"
  | "Loisirs"
  | "Remboursement"
  | "Autre";

export type ChargeScope = "solo" | "partage";
export type ChargeType = "fixe" | "variable";
// 2. Trésorerie (Dépenses occasionnelles : courses, resto, loisirs...)

export interface ICharge extends FirestoreDocument {
  description: string;
  montantTotal: number;
  payeur: string;
  beneficiaires: string[];
  dateStatistiques: string;
  moisAnnee: string;
  householdId: string;
  type: ChargeType;
  scope: ChargeScope;
  categorie: ICategorie["id"];
}

export interface IChargeFixeTemplate extends FirestoreDocument {
  householdId: string;
  categorie: string;
  description: string;
  montantTotal: number;
  payeur: string;
  beneficiaires: string[];
  jourPrelevementMensuel: number;
  scope: ChargeScope;
}

export interface ChargeFixeForm extends IChargeFixeTemplate {
  montantForm: string;
  isNew?: boolean;
}

export interface IChargeFixeSnapshot {
  description: string;
  montantTotal: number;
  payeur: string;
}

// Catégorie de revenu
export interface ICategorieRevenu extends FirestoreDocument {
  label: string;
  icon: string;
  isDefault: boolean;
}

// Revenu
export interface IRevenu extends FirestoreDocument {
  householdId: string;
  categorie: string; 
  description: string;
  montant: number;
  beneficiaire: string;
  dateReception: string;
  moisAnnee: string;
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
  chargesFixesSnapshot?: IChargeFixeTemplate[];
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
  dettesRegularisation: IDette[];
  loyerPayeurUid: string;
  chargesFixesSnapshot?: IChargeFixeSnapshot[];
}

export interface IHistoricalData {
  compteMensuel: ICompteMensuel;
  charges: ICharge[];
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
  Charges: undefined;
  Revenus: undefined;
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
  ChargeDetail: { chargeId: string; description: string };
  RevenuDetail: { revenuId: string; description: string };
};

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type RootStackRouteProp<RouteName extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, RouteName>;

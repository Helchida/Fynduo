import {
  IChargeFixe,
  IChargeVariable,
  ICompteMensuel,
  IReglementData,
  IResultatsCalcul,
} from "@/types";

export interface IComptesContext extends IResultatsCalcul {
  currentMonthData: ICompteMensuel | null;
  chargesFixes: IChargeFixe[];
  chargesVariables: IChargeVariable[];
  isLoadingComptes: boolean;
  historyMonths: ICompteMensuel[];
  loadData: () => Promise<void>;
  updateChargeFixe: (chargeId: string, newAmount: number) => Promise<void>;
  updateChargeFixePayeur: (
    chargeId: string,
    newPayeurId: string,
  ) => Promise<void>;
  updateChargeFixeDay: (chargeId: string, newDay: number) => Promise<void>;
  updateLoyer: (
    loyerTotal: number,
    apportsAPL: Record<string, number>,
    loyerPayeurUid: string,
  ) => Promise<void>;
  addChargeVariable: (
    depense: Omit<IChargeVariable, "id" | "householdId">,
  ) => Promise<void>;
  updateChargeVariable: (
    chargeId: string,
    updateData: Partial<
      Omit<IChargeVariable, "id" | "householdId" | "moisAnnee" | "date">
    >,
  ) => Promise<void>;
  deleteChargeVariable: (chargeId: string) => Promise<void>;
  addChargeFixe: (
    charge: Omit<IChargeFixe, "id" | "householdId">,
  ) => Promise<void>;
  deleteChargeFixe: (chargeId: string) => Promise<void>;
  cloturerMois: (data: IReglementData) => Promise<void>;
  loadHistory: () => Promise<void>;
  getMonthDataById: (moisAnnee: string) => ICompteMensuel | undefined;
}

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
  charges: (IChargeVariable | IChargeFixe)[];
  isLoadingComptes: boolean;
  historyMonths: ICompteMensuel[];
  loadData: () => Promise<void>;
  updateLoyer: (
    loyerTotal: number,
    apportsAPL: Record<string, number>,
    loyerPayeurUid: string,
  ) => Promise<void>;
  addChargeVariable: (
    depense: Omit<IChargeVariable, "id" | "householdId">,
  ) => Promise<void>;
  updateCharge: (
    chargeId: string,
    updateData: Partial<IChargeVariable & IChargeFixe>,
  ) => Promise<void>;
  deleteCharge: (chargeId: string) => Promise<void>;
  addChargeFixe: (
    charge: Omit<IChargeFixe, "id" | "householdId">,
  ) => Promise<void>;
  updateChargeFixe: (chargeId: string, newAmount: number) => Promise<void>;
  deleteChargeFixe: (chargeId: string) => Promise<void>;
  cloturerMois: (data: IReglementData) => Promise<void>;
  loadHistory: () => Promise<void>;
  getMonthDataById: (moisAnnee: string) => ICompteMensuel | undefined;
}

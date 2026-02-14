import {
  ICharge,
  ICompteMensuel,
  IReglementData,
  IResultatsCalcul,
} from "@/types";

export interface IComptesContext extends IResultatsCalcul {
  currentMonthData: ICompteMensuel | null;
  chargesFixes: ICharge[];
  chargesVariables: ICharge[];
  charges: ICharge[];
  isLoadingComptes: boolean;
  historyMonths: ICompteMensuel[];
  loadData: () => Promise<void>;
  updateLoyer: (
    loyerTotal: number,
    apportsAPL: Record<string, number>,
    loyerPayeurUid: string,
  ) => Promise<void>;
  addChargeVariable: (
    depense: Omit<ICharge, "id" | "householdId">,
  ) => Promise<void>;
  updateCharge: (
    chargeId: string,
    updateData: Partial<ICharge>,
  ) => Promise<void>;
  deleteCharge: (chargeId: string) => Promise<void>;
  addChargeFixe: (
    charge: Omit<ICharge, "id" | "householdId">,
  ) => Promise<void>;
  updateChargeFixe: (chargeId: string, newAmount: number) => Promise<void>;
  deleteChargeFixe: (chargeId: string) => Promise<void>;
  cloturerMois: (data: IReglementData) => Promise<void>;
  loadHistory: () => Promise<void>;
  getMonthDataById: (moisAnnee: string) => ICompteMensuel | undefined;
}

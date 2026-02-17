import {
  ICharge,
  ICompteMensuel,
  IReglementData,
  IResultatsCalcul,
  IRevenu,
} from "@/types";

export interface IComptesContext extends IResultatsCalcul {
  currentMonthData: ICompteMensuel | null;
  chargesFixes: ICharge[];
  chargesVariables: ICharge[];
  charges: ICharge[];
  revenus: IRevenu[];
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
  addRevenu: (
    revenu: Omit<IRevenu, "id" | "householdId">,
  ) => Promise<void>;
  updateRevenu: (
    revenuId: string,
    updateData: Partial<IRevenu>,
  ) => Promise<void>;
  deleteRevenu: (revenuId: string) => Promise<void>;
}

import { IChargeFixe } from "@/types";

export interface IChargesFixesConfigContext {
  isLoadingComptes: boolean;
  chargesFixesConfigs: IChargeFixe[];
  loadConfigs: () => Promise<void>;
  handleAutoAddFixedCharges: () => Promise<void>;
  updateChargeFixeConfig: (id: string, amount: number) => Promise<void>;
  updateChargeFixeConfigPayeur: (id: string, payeurId: string) => Promise<void>;
  updateChargeFixeConfigDay: (id: string, day: number) => Promise<void>;
  updateChargeFixeConfigCategorie: (id: string, categoryId: string) => Promise<void>;
  addChargeFixeConfig: (
    charge: Omit<IChargeFixe, "id" | "householdId">,
  ) => Promise<void>;
  deleteChargeFixeConfig: (id: string) => Promise<void>;
}

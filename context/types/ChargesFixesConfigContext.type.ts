import { IChargeFixeTemplate } from "@/types";


export interface IChargesFixesConfigContext {
  isLoadingComptes: boolean;
  chargesFixesConfigs: IChargeFixeTemplate[];
  loadConfigs: () => Promise<void>;
  handleAutoAddFixedCharges: () => Promise<void>;
  updateChargeFixeConfig: (id: string, amount: number) => Promise<void>;
  updateChargeFixeConfigPayeur: (id: string, payeurId: string) => Promise<void>;
  updateChargeFixeConfigDay: (id: string, day: number) => Promise<void>;
  updateChargeFixeConfigCategorie: (id: string, categoryId: string) => Promise<void>;
  addChargeFixeConfig: (
    charge: Omit<IChargeFixeTemplate, "id" | "householdId">,
  ) => Promise<void>;
  deleteChargeFixeConfig: (id: string) => Promise<void>;
}

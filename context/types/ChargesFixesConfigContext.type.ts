import { IChargeFixeTemplate } from "@/types";
import { PeriodiciteValue } from "screens/ChargesFixesScreen/PeriodiciteFormSection/PeriodiciteFormSection";


export interface IChargesFixesConfigContext {
  isLoadingComptes: boolean;
  chargesFixesConfigs: IChargeFixeTemplate[];
  loadConfigs: () => Promise<void>;
  handleAutoAddFixedCharges: () => Promise<void>;
  updateChargeFixe: (id: string, updates: Partial<IChargeFixeTemplate>) => Promise<void>;
  addChargeFixeConfig: (
    charge: Omit<IChargeFixeTemplate, "id" | "householdId">,
  ) => Promise<void>;
  deleteChargeFixeConfig: (id: string) => Promise<void>;
}

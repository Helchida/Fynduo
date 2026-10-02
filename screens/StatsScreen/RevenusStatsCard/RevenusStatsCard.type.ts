import { IRevenu, StatPeriod } from "@/types";
import { FinancialPeriod } from "utils/financialPeriods";

interface StatRevenusCategorie {
  categoryId: string;
  label: string;
  montant: number;
  icon: string;
}

export interface RevenusStatsCardProps {
  revenus: IRevenu[];
  statsRevenusParCategorie: StatRevenusCategorie[];
  totalRevenus: number;
  period: StatPeriod;
  referenceDate: string;
  isSoloMode: boolean;
  financialPeriod?: FinancialPeriod | null;
}

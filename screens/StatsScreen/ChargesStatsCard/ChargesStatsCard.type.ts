import { ChargeType, ICharge, StatCategorie, StatPeriod } from "@/types";
import { FinancialPeriod } from "utils/financialPeriods";

export interface ChargesStatsCardProps {
  charges: ICharge[];
  statsParCategorie: StatCategorie[];
  total: number;
  period: StatPeriod;
  referenceDate: string;
  isSoloMode: boolean;
  getDisplayName: (uid: string) => string;
  chargeType?: ChargeType;
  financialPeriod?: FinancialPeriod | null;
}

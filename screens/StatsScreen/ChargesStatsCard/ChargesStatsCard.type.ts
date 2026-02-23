import { ChargeType, ICharge, StatCategorie, StatPeriod } from "@/types";

export interface ChargesStatsCardProps {
  charges: ICharge[];
  statsParCategorie: StatCategorie[];
  total: number;
  period: StatPeriod;
  referenceDate: string;
  isSoloMode: boolean;
  getDisplayName: (uid: string) => string;
  chargeType?: ChargeType;
}
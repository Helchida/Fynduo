import { ICharge, StatPeriod } from "@/types";

interface StatCategorie {
  categoryId: string;
  label: string;
  montant: number;
  icon: string;
}

export interface ChargesVariablesStatsCardProps {
  charges: ICharge[];
  statsParCategorie: StatCategorie[];
  total: number;
  period: StatPeriod;
  referenceDate: string;
  isSoloMode: boolean;
  getDisplayName: (uid: string) => string;
}
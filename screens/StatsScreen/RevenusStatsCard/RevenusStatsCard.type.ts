import { IRevenu, StatPeriod } from "@/types";

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
}
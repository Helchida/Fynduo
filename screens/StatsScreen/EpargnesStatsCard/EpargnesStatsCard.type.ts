import { StatPeriod } from "@/types";
import { StatEpargne } from "../../../hooks/useEpargnesStats";

export interface EpargneStatsCardProps {
  statsParTirelire: StatEpargne[];
  totalDepose: number;
  totalRetire: number;
  period: StatPeriod;
}

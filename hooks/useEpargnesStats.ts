import { useMemo } from "react";
import { ITirelire, StatPeriod } from "@/types";
import dayjs from "dayjs";

export interface StatEpargne {
  tirelireId: string;
  description: string;
  totalDepose: number;
  totalRetire: number;
  net: number;
  mouvements: {
    id: string;
    montant: number;
    date_mouvement: string;
  }[];
}

export const useEpargneStats = (
  tirelires: ITirelire[],
  period: StatPeriod,
  referenceDate: string,
) => {
  const statsParTirelire = useMemo((): StatEpargne[] => {
    return tirelires
      .map((tirelire) => {
        const mouvements = (tirelire.mouvements || []) as {
          id: string;
          montant: number;
          date_mouvement: string;
        }[];

        const filtered = mouvements.filter((m) => {
          if (period === "tout") return true;

          const moisMouvement = dayjs(m.date_mouvement).format("YYYY-MM");

          if (period === "mois") return moisMouvement === referenceDate;
          if (period === "annee")
            return moisMouvement.startsWith(referenceDate);
          return true;
        });

        const totalDepose = filtered
          .filter((m) => m.montant > 0)
          .reduce((sum, m) => sum + m.montant, 0);

        const totalRetire = filtered
          .filter((m) => m.montant < 0)
          .reduce((sum, m) => sum + Math.abs(m.montant), 0);

        return {
          tirelireId: tirelire.id,
          description: tirelire.description,
          totalDepose,
          totalRetire,
          net: totalDepose - totalRetire,
          mouvements: filtered.sort((a, b) =>
            b.date_mouvement.localeCompare(a.date_mouvement),
          ),
        };
      })
      .filter((stat) => stat.mouvements.length > 0)
      .sort((a, b) => b.net - a.net);
  }, [tirelires, period, referenceDate]);

  const totalDepose = useMemo(
    () => statsParTirelire.reduce((sum, s) => sum + s.totalDepose, 0),
    [statsParTirelire],
  );

  const totalRetire = useMemo(
    () => statsParTirelire.reduce((sum, s) => sum + s.totalRetire, 0),
    [statsParTirelire],
  );

  const netTotal = useMemo(
    () => totalDepose - totalRetire,
    [totalDepose, totalRetire],
  );

  return { statsParTirelire, totalDepose, totalRetire, netTotal };
};
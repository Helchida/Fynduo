import { ITirelire } from "@/types";
import { useCallback, useRef, useState, useMemo } from "react";
import {
  getTirelires,
  getTotalMouvEpargneForPeriod,
  getTotalPlaceEpargneForPeriod,
  getSubTirelires,
} from "services/supabase/db";
import { FinancialPeriod } from "utils/financialPeriods";

export const useEpargneData = (
  userId: string | undefined,
  period?: FinancialPeriod | null,
) => {
  const [tirelires, setTirelires] = useState<ITirelire[]>([]);
  const [totalEpargnesMouvementCeMois, setTotalEpargnesMouvementCeMois] =
    useState(0);
  const [totalEpargnesPlaceCeMois, setTotalEpargnesPlaceCeMois] = useState(0);
  const [loading, setLoading] = useState(false);
  const refreshSequence = useRef(0);
  const periodKey = period ? `${period.start}:${period.end ?? "open"}` : "none";

  const getCagnottes = useCallback((idTirelire: string) => {
    const cagnottes = getSubTirelires(idTirelire);
    return cagnottes;
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const requestId = ++refreshSequence.current;
    setLoading(true);
    try {
      const [list, total, totalPlace] = await Promise.all([
        getTirelires(userId),
        period
          ? getTotalMouvEpargneForPeriod(userId, period)
          : Promise.resolve(0),
        period
          ? getTotalPlaceEpargneForPeriod(userId, period)
          : Promise.resolve(0),
      ]);

      if (requestId !== refreshSequence.current) return;
      setTirelires(list);
      setTotalEpargnesMouvementCeMois(total);
      setTotalEpargnesPlaceCeMois(totalPlace);
    } catch (err) {
      console.error("Erreur de chargement épargne:", err);
    } finally {
      if (requestId === refreshSequence.current) setLoading(false);
    }
  }, [userId, periodKey]);

  const updateLocalTirelire = (id: string, partialData: Partial<ITirelire>) => {
    setTirelires((current) =>
      current.map((t) => (t.id === id ? { ...t, ...partialData } : t)),
    );
  };

  const getTotalObjectifsTirelires = useCallback(() => {
    return tirelires.reduce((sum, t) => sum + t.objectif, 0);
  }, [tirelires]);

  // Récupération et formatage de TOUS les mouvements d'épargne (toutes tirelires confondues)
  const allSavingsMovements = useMemo(() => {
    const movements: any[] = [];
    tirelires.forEach((t) => {
      if (t.mouvements && Array.isArray(t.mouvements)) {
        t.mouvements.forEach((m) => {
          const montantNum = Number(m.montant);

          // On ne garde que les placements (montants supérieurs à 0)
          if (montantNum > 0) {
            movements.push({
              id: `epargne-${m.id}`,
              description: `Épargne : ${t.description}`,
              montantTotal: Number(m.montant),
              dateStatistiques: m.date_mouvement
                ? m.date_mouvement.slice(0, 10)
                : "",
              moisAnnee: m.date_mouvement ? m.date_mouvement.slice(0, 7) : "",
              type: "epargne",
              nature: "epargne",
              isEpargne: true,
              tirelireId: t.id,
            });
          }
        });
      }
    });
    return movements;
  }, [tirelires]);

  return {
    tirelires,
    allSavingsMovements,
    totalEpargnesMouvementCeMois,
    totalEpargnesPlaceCeMois,
    loading,
    refresh,
    getCagnottes,
    updateLocalTirelire,
    getTotalObjectifsTirelires,
  };
};

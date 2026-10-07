import { ITirelire } from "@/types";
import { useCallback, useRef, useState } from "react";
import {
  getTirelires,
  getTotalMouvEpargneForPeriod,
  getTotalPlaceEpargneForPeriod,
  getSubTirelires,
} from "services/supabase/db";
import { FinancialPeriod } from "utils/financialPeriods";

export const useEpargneData = (
  userId: string | undefined,
  period: FinancialPeriod | null,
) => {
  const [tirelires, setTirelires] = useState<ITirelire[]>([]);
  const [totalEpargnesMouvementCeMois, setTotalEpargnesMouvementCeMois] = useState(0);
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
        getTotalMouvEpargneForPeriod(userId, period),
        getTotalPlaceEpargneForPeriod(userId, period),
      ]);
      // An older request can finish after a withdrawal mutation. Do not let it
      // overwrite the more recent period totals with its stale snapshot.
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

  return {
    tirelires,
    totalEpargnesMouvementCeMois,
    totalEpargnesPlaceCeMois,
    loading,
    refresh,
    getCagnottes,
    updateLocalTirelire,
    getTotalObjectifsTirelires,
  };
};

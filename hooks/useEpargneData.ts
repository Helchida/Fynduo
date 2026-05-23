import { ITirelire } from "@/types";
import { useCallback, useState } from "react";
import {
  getTirelires,
  getTotalMouvEpargneMois,
  getTotalPlaceEpargneMois,
  getSubTirelires,
} from "services/supabase/db";

export const useEpargneData = (
  userId: string | undefined,
  moisAnnee: string,
) => {
  const [tirelires, setTirelires] = useState<ITirelire[]>([]);
  const [totalEpargnesMouvementCeMois, setTotalEpargnesMouvementCeMois] = useState(0);
  const [totalEpargnesPlaceCeMois, setTotalEpargnesPlaceCeMois] = useState(0);
  const [loading, setLoading] = useState(false);

  const getCagnottes = useCallback((idTirelire: string) => {
    const cagnottes = getSubTirelires(idTirelire);
    return cagnottes;
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [list, total, totalPlace] = await Promise.all([
        getTirelires(userId),
        getTotalMouvEpargneMois(userId, moisAnnee),
        getTotalPlaceEpargneMois(userId, moisAnnee),
      ]);
      setTirelires(list);
      setTotalEpargnesMouvementCeMois(total);
      setTotalEpargnesPlaceCeMois(totalPlace);
    } catch (err) {
      console.error("Erreur de chargement épargne:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, moisAnnee]);

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

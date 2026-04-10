import { ITirelire } from "@/types";
import { get } from "http";
import { useCallback, useState } from "react";
import {
  getTirelires,
  getTotalPlaceMois,
  getSubTirelires,
} from "services/supabase/db";

export const useEpargneData = (
  userId: string | undefined,
  moisAnnee: string,
) => {
  const [tirelires, setTirelires] = useState<ITirelire[]>([]);
  const [dejaPlaceCeMois, setDejaPlaceCeMois] = useState(0);
  const [loading, setLoading] = useState(false);

  const getCagnottes = useCallback((idTirelire: string) => {
    const cagnottes = getSubTirelires(idTirelire);
    return cagnottes;
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [list, total] = await Promise.all([
        getTirelires(userId),
        getTotalPlaceMois(userId, moisAnnee),
      ]);
      setTirelires(list);
      setDejaPlaceCeMois(total);
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
    dejaPlaceCeMois,
    loading,
    refresh,
    getCagnottes,
    updateLocalTirelire,
    getTotalObjectifsTirelires,
  };
};

import { ITirelire } from "@/types";
import { useCallback, useState, useEffect } from "react";
import { getSubTirelires } from "services/supabase/db";

export const useSubTirelires = (parentId: string) => {
  const [subTirelires, setSubTirelires] = useState<ITirelire[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getSubTirelires(parentId);
      setSubTirelires(list);
    } catch (err) {
      console.error("Erreur chargement sous-tirelires:", err);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  const updateLocalSubTirelire = (id: string, partialData: Partial<ITirelire>) => {
    setSubTirelires((current) =>
      current.map((t) => (t.id === id ? { ...t, ...partialData } : t)),
    );
  };

  useEffect(() => {
    refresh();
  }, [refresh]);



  return { subTirelires, loading, refresh, updateLocalSubTirelire };
};
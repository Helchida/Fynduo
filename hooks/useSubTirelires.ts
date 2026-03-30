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

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { subTirelires, loading, refresh };
};
import { ICategorie } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { getHouseholdCategories } from "services/firebase/db";

export const useCategories = (householdId: string) => {
  const [categories, setCategories] = useState<ICategorie[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const defaultCategory = categories.find((c) => c.isDefault);

  useEffect(() => {
    if (!householdId) return;

    const fetchCats = async () => {
      try {
        const data = await getHouseholdCategories(householdId);
        setCategories(data);
      } catch (error) {
        console.error("Erreur hook useCategories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCats();
  }, [householdId]);

  const getCategoryLabel = useCallback(
    (categoryId: string | null) => {
      if (!categoryId) return "Autre";
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.label : "Autre";
    },
    [categories]
  );

  return { categories, isLoadingCategories, getCategoryLabel, defaultCategory };
};

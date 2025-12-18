import { ICategorie } from "@/types";
import { useEffect, useState } from "react";
import { getHouseholdCategories } from "services/firebase/db";

export const useCategories = (householdId: string) => {
  const [categories, setCategories] = useState<ICategorie[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

  return { categories, isLoadingCategories };
};

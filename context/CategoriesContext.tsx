import { createContext, useCallback, useEffect, useState } from "react";
import { ICategoriesContext } from "./types/CategoriesContext.type";
import { ICategorie } from "@/types";
import { useAuth } from "hooks/useAuth";
import * as DB from "../services/firebase/db";

export const CategoriesContext = createContext<ICategoriesContext>(
  {} as ICategoriesContext
);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<ICategorie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCats = useCallback(async () => {
    if (!user?.householdId) return;
    try {
      setIsLoading(true);
      const data = await DB.getHouseholdCategories(user.householdId);
      setCategories(data);
    } catch (error) {
      console.error("Erreur CategoryContext fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.householdId]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const createCategory = async (label: string, icon: string) => {
    if (!user?.householdId) return;
    const newCat = { label, icon, isDefault: false };
    await DB.addCategory(user.householdId, newCat);
    await fetchCats();
  };

  const editCategory = async (id: string, data: Partial<ICategorie>) => {
    if (!user?.householdId) return;
    await DB.updateCategory(user.householdId, id, data);
    await fetchCats();
  };

  const removeCategory = async (id: string) => {
    if (!user?.householdId || !defaultCategory) return;
    try {
      await DB.migrateChargesOnDelete(user.householdId, id, defaultCategory.id);
      await DB.deleteCategory(user.householdId, id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie :", error);
    }

    await fetchCats();
  };

  const getCategoryLabel = useCallback(
    (categoryId: string | null) => {
      if (!categoryId) return "Autre";
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.label : "Autre";
    },
    [categories]
  );

  const defaultCategory = categories.find((c) => c.isDefault);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        isLoadingCategories: isLoading,
        defaultCategory,
        getCategoryLabel,
        refreshCategories: fetchCats,
        createCategory,
        editCategory,
        removeCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

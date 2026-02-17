import { createContext, useCallback, useEffect, useState } from "react";
import { ICategoriesContext } from "./types/CategoriesContext.type";
import { ICategorie, ICategorieRevenu } from "@/types";
import { useAuth } from "hooks/useAuth";
import * as DB from "../services/supabase/db";

export const CategoriesContext = createContext<ICategoriesContext>(
  {} as ICategoriesContext,
);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categoriesRevenus, setCategoriesRevenus] = useState<
    ICategorieRevenu[]
  >([]);
  const [categories, setCategories] = useState<ICategorie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCats = useCallback(async () => {
    if (!user?.activeHouseholdId) return;
    try {
      setIsLoading(true);
      const [expenseData, incomeData] = await Promise.all([
        DB.getHouseholdCategories(user.activeHouseholdId),
        DB.getCategoriesRevenus(user.activeHouseholdId),
      ]);

      console.log("Catégories revenus reçues :", incomeData);

      setCategories(expenseData);
      setCategoriesRevenus(incomeData);
    } catch (error) {
      console.error("Erreur CategoryContext fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.activeHouseholdId]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const createCategoryRevenu = async (label: string, icon: string) => {
    if (!user?.activeHouseholdId) return;
    const newCat = { label, icon, isDefault: false };
    await DB.addCategorieRevenu(user.activeHouseholdId, newCat);
    await fetchCats();
  };

  const editCategoryRevenu = async (
    id: string,
    data: Partial<ICategorieRevenu>,
  ) => {
    if (!user?.activeHouseholdId) return;
    await DB.updateCategorieRevenu(user.activeHouseholdId, id, data);
    await fetchCats();
  };

  const removeCategoryRevenu = async (id: string) => {
    if (!user?.activeHouseholdId || !defaultCategoryRevenu) return;
    try {
      await DB.migrateChargesOnDelete(
        user.activeHouseholdId,
        id,
        defaultCategoryRevenu.id,
      );
      await DB.deleteCategorieRevenu(user.activeHouseholdId, id);
      setCategoriesRevenus((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie :", error);
    }

    await fetchCats();
  };

  const createCategory = async (label: string, icon: string) => {
    if (!user?.activeHouseholdId) return;
    const newCat = { label, icon, isDefault: false };
    await DB.addCategory(user.activeHouseholdId, newCat);
    await fetchCats();
  };

  const editCategory = async (id: string, data: Partial<ICategorie>) => {
    if (!user?.activeHouseholdId) return;
    await DB.updateCategory(user.activeHouseholdId, id, data);
    await fetchCats();
  };

  const removeCategory = async (id: string) => {
    if (!user?.activeHouseholdId || !defaultCategory) return;
    try {
      await DB.migrateChargesOnDelete(
        user.activeHouseholdId,
        id,
        defaultCategory.id,
      );
      await DB.deleteCategory(user.activeHouseholdId, id);
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
    [categories],
  );

  const getCategoryRevenuLabel = useCallback(
    (categoryRevenuId: string | null) => {
      if (!categoryRevenuId) return "cat_autre";
      const categoryRevenu = categoriesRevenus.find(
        (c) => c.id === categoryRevenuId,
      );
      return categoryRevenu ? categoryRevenu.label : "cat_autre";
    },
    [categoriesRevenus],
  );

  const defaultCategory = categories.find((c) => c.isDefault);
  const defaultCategoryRevenu = categoriesRevenus.find((c) => c.isDefault);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        categoriesRevenus,
        getCategoryRevenuLabel,
        isLoadingCategories: isLoading,
        defaultCategory,
        defaultCategoryRevenu,
        getCategoryLabel,
        refreshCategories: fetchCats,
        createCategory,
        editCategory,
        removeCategory,
        createCategoryRevenu,
        editCategoryRevenu,
        removeCategoryRevenu,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

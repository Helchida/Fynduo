import { ICategorie, ICategorieRevenu } from "@/types";

export interface ICategoriesContext {
  categories: ICategorie[];
  categoriesRevenus: ICategorieRevenu[];
  isLoadingCategories: boolean;
  defaultCategory: ICategorie | undefined;
  defaultCategoryRevenu: ICategorieRevenu | undefined;
  getCategoryLabel: (categoryId: string | null) => string;
  getCategoryRevenuLabel: (categoryRevenuId: string | null) => string;
  refreshCategories: () => Promise<void>;
  createCategory: (label: string, icon: string) => Promise<void>;
  editCategory: (id: string, data: Partial<ICategorie>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  createCategoryRevenu: (label: string, icon: string) => Promise<void>;
  editCategoryRevenu: (id: string, data: Partial<ICategorieRevenu>) => Promise<void>;
  removeCategoryRevenu: (id: string) => Promise<void>;
}

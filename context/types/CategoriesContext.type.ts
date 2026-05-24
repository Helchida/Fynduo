import { ICategorie, ICategorieRevenu, PropagationConflict, PropagationResolution } from "@/types";

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
  getSimilarCategories: (input: string) => Array<ICategorie & { score: number }>;
  getSimilarCategoriesRevenus: (input: string) => Array<ICategorieRevenu & { score: number }>;
  checkCategoryConflicts: (label: string) => Promise<PropagationConflict[]>;
  createCategoryWithResolutions: (
    label: string,
    icon: string,
    resolutions: PropagationResolution[],
  ) => Promise<void>;
}

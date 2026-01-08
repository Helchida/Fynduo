import { ICategorie } from "@/types";

export interface ICategoriesContext {
  categories: ICategorie[];
  isLoadingCategories: boolean;
  defaultCategory: ICategorie | undefined;
  getCategoryLabel: (categoryId: string | null) => string;
  refreshCategories: () => Promise<void>;
  createCategory: (label: string, icon: string) => Promise<void>;
  editCategory: (id: string, data: Partial<ICategorie>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

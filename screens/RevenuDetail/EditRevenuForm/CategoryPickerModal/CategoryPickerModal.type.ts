import { CategoryType, ICategorieRevenu } from "@/types";

export interface CategoryPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (uid: CategoryType) => void;
  categoriesRevenus: ICategorieRevenu[];
}

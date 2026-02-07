import { CategoryType, ICategorie } from "@/types";

export interface CategoryPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (uid: CategoryType) => void;
  categories: ICategorie[];
}

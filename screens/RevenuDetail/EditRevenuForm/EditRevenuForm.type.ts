import { ICategorie, ICategorieRevenu, IUser } from "@/types";

export interface EditRevenuFormProps {
  editDescription: string;
  setEditDescription: (value: string) => void;
  editMontant: string;
  setEditMontant: (value: string) => void;
  editDateReception: Date;
  showDateReceptionPicker: () => void;
  isDateReceptionPickerVisible: boolean;
  handleConfirmDateReception: (date: Date) => void;
  hideDateReceptionPicker: () => void;
  isSubmitting: boolean;
  handleUpdateRevenu: () => void;
  setIsEditing: (value: boolean) => void;
  editCategorie: string;
  setEditCategorie: (value: string) => void;
  setIsCategoryModalVisible: (value: boolean) => void;
  isCategoryModalVisible: boolean;
  categoriesRevenus: ICategorieRevenu[];
  isReferencePay: boolean;
  setIsReferencePay: (value: boolean) => void;
  isSoloHousehold: boolean;
}

import { CategoryType } from "@/types";

export interface EditChargeVariableFormProps {
  editDescription: string;
  setEditDescription: (val: string) => void;
  editMontant: string;
  setEditMontant: (val: string) => void;
  editPayeurUid: string | null;
  setIsPayeurModalVisible: (visible: boolean) => void;
  isPayeurModalVisible: boolean;
  householdUsers: any[];
  getDisplayName: (uid: string) => string;
  setEditPayeurUid: (uid: string) => void;
  editDate: Date;
  showDatePicker: () => void;
  isDatePickerVisible: boolean;
  handleConfirmDate: (date: Date) => void;
  hideDatePicker: () => void;
  editBeneficiairesUid: string[];
  handleToggleEditBeneficiaire: (uid: string) => void;
  currentUserId: string;
  isSubmitting: boolean;
  handleUpdateCharge: () => void;
  setIsEditing: (val: boolean) => void;
  editCategorie: string;
  setEditCategorie: (id: CategoryType) => void;
  setIsCategoryModalVisible: (visible: boolean) => void;
  isCategoryModalVisible: boolean;
}

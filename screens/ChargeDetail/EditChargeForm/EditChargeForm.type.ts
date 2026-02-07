import { ICategorie, IUser } from "@/types";

export interface EditChargeFormProps {
  editDescription: string;
  setEditDescription: (value: string) => void;
  editMontant: string;
  setEditMontant: (value: string) => void;
  editPayeurUid: string | null;
  setIsPayeurModalVisible: (value: boolean) => void;
  isPayeurModalVisible: boolean;
  householdUsers: IUser[];
  getDisplayName: (uid: string) => string;
  setEditPayeurUid: (uid: string) => void;
  editDateStatistiques: Date;
  editDateComptes: Date;
  showDateStatistiquesPicker: () => void;
  showDateComptesPicker: () => void;
  isDateStatistiquesPickerVisible: boolean;
  isDateComptesPickerVisible: boolean;
  handleConfirmDateStatistiques: (date: Date) => void;
  handleConfirmDateComptes: (date: Date) => void;
  hideDateStatistiquesPicker: () => void;
  hideDateComptesPicker: () => void;
  editBeneficiairesUid: string[];
  handleToggleEditBeneficiaire: (userId: string) => void;
  currentUserId: string;
  isSubmitting: boolean;
  handleUpdateCharge: () => void;
  setIsEditing: (value: boolean) => void;
  editCategorie: string;
  setEditCategorie: (value: string) => void;
  setIsCategoryModalVisible: (value: boolean) => void;
  isCategoryModalVisible: boolean;
  categories: ICategorie[];
}

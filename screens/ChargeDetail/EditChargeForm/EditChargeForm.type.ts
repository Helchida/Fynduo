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
  showDateStatistiquesPicker: () => void;
  isDateStatistiquesPickerVisible: boolean;
  handleConfirmDateStatistiques: (date: Date) => void;
  hideDateStatistiquesPicker: () => void;
  editBeneficiairesUid: string[];
  handleToggleEditBeneficiaire: (userId: string) => void;
  currentUserId: string;
  isSubmitting: boolean;
  handleUpdateCharge: (repartitionParam?: Record<string, number>) => Promise<void>;
  setIsEditing: (value: boolean) => void;
  editCategorie: string;
  setEditCategorie: (value: string) => void;
  setIsCategoryModalVisible: (value: boolean) => void;
  isCategoryModalVisible: boolean;
  categories: ICategorie[];
  editSplitMode: "egal" | "part";
  setEditSplitMode: (mode: "egal" | "part") => void;
  editRepartition: Record<string, number>;
  editLockedUids: string[];
  handleChangeEditMontant: (uid: string, montant: number) => void;
  handleChangeEditTaux: (uid: string, taux: number) => void;
  handleResetEditRepartition: () => void;
  editRepartitionError: string | null;
}

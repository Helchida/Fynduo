import { IUser } from "@/types";

export interface PayeurPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  users: IUser[];
  selectedUid: string | null;
  onSelect: (uid: string) => void;
  getDisplayName: (uid: string) => string;
}

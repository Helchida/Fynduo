import { IUser } from "@/types";

export interface BeneficiariesSelectorProps {
  users: IUser[];
  selectedUids: string[];
  totalAmount: string;
  onToggle: (uid: string) => void;
  getDisplayName: (uid: string, isMe?: boolean) => string;
  currentUserId: string;
}

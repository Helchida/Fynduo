import { IUser } from "@/types";

export type SplitMode = "egal" | "part";
export interface BeneficiariesSelectorProps {
  users: IUser[];
  selectedUids: string[];
  totalAmount: string;
  onToggle: (uid: string) => void;
  getDisplayName: (uid: string, isMe?: boolean) => string;
  currentUserId: string;
  splitMode: SplitMode;
  onSplitModeChange: (mode: SplitMode) => void;
  repartition: Record<string, number>;
  lockedUids: string[];
  onChangeMontant: (uid: string, montant: number) => void;
  onChangeTaux: (uid: string, taux: number) => void;
  onReset: () => void;
  hasError: string | null;
}

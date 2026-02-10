import { ChargeType } from "@/types";

export interface TypeChargePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (id: ChargeType) => void;
}

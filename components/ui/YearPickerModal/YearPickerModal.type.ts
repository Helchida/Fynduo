import { IChargeVariable } from "@/types";

export interface YearPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedYear: string | null;
  onSelect: (year: string) => void;
  chargesVariables: IChargeVariable[];
}

import { IChargeVariable } from "@/types";

export interface PeriodPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMonth: string | null;
  selectedYear: string | null;
  onSelectMonth: (month: string) => void;
  onSelectYear: (year: string) => void;
  chargesVariables: IChargeVariable[];
}

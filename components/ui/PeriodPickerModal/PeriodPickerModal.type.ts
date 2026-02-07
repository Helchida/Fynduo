import { IChargeFixe, IChargeVariable } from "@/types";

export interface PeriodPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMonth: string | null;
  selectedYear: string | null;
  onSelectMonth: (month: string) => void;
  onSelectYear: (year: string) => void;
  charges: (IChargeVariable | IChargeFixe)[];
  mode?: "both" | "month" | "year";
}

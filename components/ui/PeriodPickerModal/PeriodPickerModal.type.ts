import { ICharge } from "@/types";

export interface PeriodPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMonth: string | null;
  selectedYear: string | null;
  onSelectMonth: (month: string) => void;
  onSelectYear: (year: string) => void;
  charges: ICharge[];
  mode?: "both" | "month" | "year";
}

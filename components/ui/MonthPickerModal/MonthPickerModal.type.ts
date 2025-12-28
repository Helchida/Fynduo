import { IChargeVariable } from "@/types";

export interface MonthPickerModalProps {
    isVisible: boolean;
    onClose: () => void;
    selectedMonth: string | null;
    onSelect: (month: string) => void;
    chargesVariables: IChargeVariable[];
}
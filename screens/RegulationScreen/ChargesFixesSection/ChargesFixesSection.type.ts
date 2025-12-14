import { ChargeFixeForm, IUser } from "@/types";

export interface ChargesFixesSectionProps {
    householdUsers: IUser[];
    chargesFormMap: Record<string, ChargeFixeForm[]>;
    getDisplayName: (uid: string) => string;
    handleAddCharge: (targetUid: string) => void;
    updateChargeForm: (targetUid: string) => (id: string, field: 'nom' | 'montantForm', value: string) => void;
    handleDeleteCharge: (id: string, targetUid: string) => void;
}
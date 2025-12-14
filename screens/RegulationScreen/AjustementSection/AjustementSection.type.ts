import { IUser } from "@/types";

export interface AjustementSectionProps {
    householdUsers: IUser[];
    uid1: string;
    uid2: string;
    dettesAjustements: Record<string, string>;
    updateDettesAjustements: (key: string, text: string) => void;
    getDisplayName: (uid: string) => string;
}

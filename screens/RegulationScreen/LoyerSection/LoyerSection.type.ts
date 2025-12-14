import { IUser } from "@/types";

export interface LoyerSectionProps {
  moisDeLoyerAffiche: string;
  loyerTotal: string;
  updateLoyerTotal: (text: string) => void;
  householdUsers: IUser[];
  apportsAPLForm: Record<string, string>;
  updateApportsAPLForm: (uid: string, text: string) => void;
  getDisplayName: (uid: string) => string;
}

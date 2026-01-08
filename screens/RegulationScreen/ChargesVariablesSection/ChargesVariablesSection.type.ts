import { IChargeVariable, IUser } from "@/types";

export interface IVirement {
  de: string;
  a: string;
  montant: number;
}

export interface ChargesVariablesSectionProps {
  chargesVariables: IChargeVariable[];
  householdUsers: IUser[];
  virements: IVirement[];
  getDisplayName: (uid: string) => string;
}

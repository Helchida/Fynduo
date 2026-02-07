import { IChargeFixe, IChargeVariable, IUser } from "@/types";

export interface IVirement {
  de: string;
  a: string;
  montant: number;
}

export interface ChargesSectionProps {
  charges: (IChargeVariable | IChargeFixe)[];
  householdUsers: IUser[];
  virements: IVirement[];
  getDisplayName: (uid: string) => string;
}

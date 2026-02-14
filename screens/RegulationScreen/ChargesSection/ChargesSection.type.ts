import { ICharge, IUser } from "@/types";

export interface IVirement {
  de: string;
  a: string;
  montant: number;
}

export interface ChargesSectionProps {
  charges: ICharge[];
  householdUsers: IUser[];
  virements: IVirement[];
  getDisplayName: (uid: string) => string;
}

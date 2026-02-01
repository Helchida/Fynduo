import { IChargeFixe, IUser } from "@/types";

export interface ChargeFixeItemProps {
  charge: IChargeFixe;
  householdUsers: IUser[];
  onUpdate: (id: string, newAmount: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdatePayeur: (
    id: string,
    newPayeurUid: string,
    newPayeurName: string,
  ) => Promise<void>;
  onUpdateDay: (id: string, newDay: number) => Promise<void>;
}

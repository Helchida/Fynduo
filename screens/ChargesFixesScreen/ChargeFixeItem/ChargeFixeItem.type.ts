import { IChargeFixeTemplate, IUser } from "@/types";

export interface ChargeFixeItemProps {
  charge: IChargeFixeTemplate;
  householdUsers: IUser[];
  onUpdate: (id: string, updates: Partial<IChargeFixeTemplate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

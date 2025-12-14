import { IChargeVariable, IUser } from "@/types";

export interface ChargeVariableItemProps {
  charge: IChargeVariable;
  householdUsers: IUser[];
}

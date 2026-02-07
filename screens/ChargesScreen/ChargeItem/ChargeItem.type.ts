import { IChargeFixe, IChargeVariable, IUser } from "@/types";

export interface ChargeItemProps {
  charge: IChargeVariable | IChargeFixe;
  householdUsers: IUser[];
  onPress: (charge: IChargeVariable | IChargeFixe) => void;
}

import { ICharge, IUser } from "@/types";

export interface ChargeItemProps {
  charge: ICharge;
  householdUsers: IUser[];
  onPress: (charge: ICharge) => void;
}

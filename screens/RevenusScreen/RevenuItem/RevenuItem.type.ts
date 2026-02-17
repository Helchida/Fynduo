import { IRevenu } from "@/types";

export interface RevenuItemProps {
  revenu: IRevenu;
  onPress: (revenu: IRevenu) => void;
}

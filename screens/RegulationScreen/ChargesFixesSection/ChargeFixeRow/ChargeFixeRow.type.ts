import { ChargeFixeForm } from "@/types";

export interface ChargeFixeRowProps {
  charge: ChargeFixeForm;
  onUpdate: (id: string, field: "nom" | "montantForm", value: string) => void;
  onDelete: (id: string) => void;
}

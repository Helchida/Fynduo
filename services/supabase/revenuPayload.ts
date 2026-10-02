import type { IRevenu } from "@/types";

export interface RevenuInsertPayload {
  id: string;
  household_id: string;
  categorie: string;
  description: string;
  montant: number;
  beneficiaire: string;
  date_reception: string;
  mois_annee: string;
  is_reference_pay: boolean;
}

/** Maps the creation form's revenue model to the single Supabase INSERT payload. */
export const toRevenuInsertPayload = (
  householdId: string,
  revenuId: string,
  revenu: Omit<IRevenu, "id" | "householdId">,
): RevenuInsertPayload => ({
  id: revenuId,
  household_id: householdId,
  categorie: revenu.categorie,
  description: revenu.description,
  montant: revenu.montant,
  beneficiaire: revenu.beneficiaire,
  date_reception: revenu.dateReception,
  mois_annee: revenu.moisAnnee,
  is_reference_pay: revenu.isReferencePay,
});

/**
 * Remaining savings capacity is entirely derived from persisted period data:
 * real income, expenses, and the net savings movements already recorded in
 * that same financial period. A piggy-bank withdrawal is represented only by
 * its negative savings movement, not as additional income.
 */
export const calculateSavingsCapacity = (
  totalIncome: number,
  totalExpenses: number,
  netSavingsMovements: number,
) => totalIncome - totalExpenses - netSavingsMovements;

import { ICharge, IRevenu } from "@/types";

/**
 * Produces the bank-transferable totals for a persisted financial period.
 * Financial reporting intentionally keeps using every income and expense;
 * this filter is reserved for the savings-capacity calculation.
 */
export const getBankTransferableTotals = (
  revenus: IRevenu[],
  charges: ICharge[],
  currentUserId: string,
  isSoloMode: boolean,
) => {
  const revenusTotal = revenus
    .filter((revenu) => revenu.categorie !== "cat_retrait_epargne")
    .filter((revenu) => !revenu.isNonTransferable)
    .reduce((total, revenu) => total + (Number(revenu.montant) || 0), 0);

  const depensesTotal = charges
    .filter((charge) => charge.nature === "depense")
    .filter((charge) => !charge.isNonTransferable)
    .reduce((total, charge) => {
      const montant = Number(charge.montantTotal) || 0;
      if (isSoloMode && charge.beneficiaires?.length > 0) {
        return charge.beneficiaires.includes(currentUserId)
          ? total + montant / charge.beneficiaires.length
          : total;
      }
      return total + montant;
    }, 0);

  return { revenus: revenusTotal, depenses: depensesTotal };
};

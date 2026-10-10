import { BudgetTotals, ICharge } from "@/types";
import { FinancialPeriod, isDateInFinancialPeriod } from "./financialPeriods";

export const roundEuro = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const parseEuroAmount = (value: string): number | null => {
  const normalized = value.trim().replace(",", ".");
  if (!normalized || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? roundEuro(amount) : null;
};

export const formatEuro = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(roundEuro(value));

export const getBudgetTotals = (
  initialAmount: number,
  categoryIds: string[],
  charges: ICharge[],
  financialPeriod: FinancialPeriod,
  options: { isSoloMode?: boolean; currentUserId?: string } = {},
): BudgetTotals => {
  const categorySet = new Set(categoryIds);
  const spentAmount = charges.reduce((total, charge) => {
    if (
      charge.nature === "remboursement" ||
      !categorySet.has(charge.categorie) ||
      !isDateInFinancialPeriod(charge.dateStatistiques, financialPeriod)
    ) return total;
    const amount = Number(charge.montantTotal) || 0;
    if (options.isSoloMode && charge.beneficiaires?.length) {
      if (!options.currentUserId || !charge.beneficiaires.includes(options.currentUserId)) return total;
      const share = charge.repartition?.[options.currentUserId] ?? amount / charge.beneficiaires.length;
      return total + share;
    }
    return total + amount;
  }, 0);

  const roundedSpent = roundEuro(spentAmount);
  return {
    initialAmount: roundEuro(initialAmount),
    spentAmount: roundedSpent,
    remainingAmount: roundEuro(initialAmount - roundedSpent),
  };
};

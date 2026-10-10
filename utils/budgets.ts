import { BudgetTotals, ICharge } from "@/types";
import { FinancialPeriod, isDateInFinancialPeriod } from "./financialPeriods";

export const euroToCents = (value: number): number => Math.round(value * 100);
export const centsToEuro = (value: number): number => value / 100;

export const parseEuroToCents = (value: string): number | null => {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? euroToCents(amount) : null;
};

export const getBudgetTotals = (
  initialAmountCents: number,
  categoryIds: string[],
  charges: ICharge[],
  financialPeriod: FinancialPeriod,
  options: { isSoloMode?: boolean; currentUserId?: string } = {},
): BudgetTotals => {
  const categorySet = new Set(categoryIds);
  const spentAmountCents = charges.reduce((total, charge) => {
    if (
      charge.nature === "remboursement" ||
      !categorySet.has(charge.categorie) ||
      !isDateInFinancialPeriod(charge.dateStatistiques, financialPeriod)
    ) return total;
    const amountCents = euroToCents(Number(charge.montantTotal) || 0);
    // Shared expenses copied into a solo household must contribute only the
    // member's share, exactly like the existing statistics calculation.
    if (options.isSoloMode && charge.beneficiaires?.length) {
      if (!options.currentUserId || !charge.beneficiaires.includes(options.currentUserId)) return total;
      return total + Math.round(amountCents / charge.beneficiaires.length);
    }
    return total + amountCents;
  }, 0);

  return {
    initialAmountCents,
    spentAmountCents,
    remainingAmountCents: initialAmountCents - spentAmountCents,
  };
};

export const formatCents = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(centsToEuro(value));

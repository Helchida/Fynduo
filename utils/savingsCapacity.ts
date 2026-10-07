/**
 * Remaining savings capacity is entirely derived from persisted period data:
 * all income (including a piggy-bank withdrawal), expenses, and the net
 * savings movements already recorded in that same financial period.
 */
export const calculateSavingsCapacity = (
  totalIncome: number,
  totalExpenses: number,
  netSavingsMovements: number,
) => totalIncome - totalExpenses - netSavingsMovements;

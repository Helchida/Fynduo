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

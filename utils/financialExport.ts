import dayjs from "dayjs";
import "dayjs/locale/fr";
import { ICharge, IRevenu } from "@/types";

export type FinancialExportTransaction = {
  id: string;
  kind: "income" | "expense";
  date: string;
  description: string;
  category: string;
  amount: number;
};

export type FinancialExportMonth = {
  key: string;
  label: string;
  transactions: FinancialExportTransaction[];
  incomes: number;
  expenses: number;
  balance: number;
};

export const formatEuro = (amount: number, sign?: "+" | "-") =>
  `${sign ?? ""}${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))} €`;

export const validateExportRange = (start?: Date, end?: Date) => {
  if (!start || !end) return "Les deux dates sont obligatoires.";
  if (dayjs(start).isAfter(dayjs(end), "day")) {
    return "La date de début doit être antérieure ou égale à la date de fin.";
  }
  return null;
};

export const buildFinancialExport = ({
  revenus,
  charges,
  revenueCategoryLabel,
  chargeCategoryLabel,
  householdId,
  start,
  end,
}: {
  revenus: IRevenu[];
  charges: ICharge[];
  revenueCategoryLabel: (id: string) => string;
  chargeCategoryLabel: (id: string) => string;
  householdId?: string;
  start?: Date;
  end?: Date;
}) => {
  const startDay = start ? dayjs(start).startOf("day") : null;
  const endDay = end ? dayjs(end).endOf("day") : null;
  const isInRange = (date: string) => {
    const day = dayjs(date);
    return (!startDay || !day.isBefore(startDay)) && (!endDay || !day.isAfter(endDay));
  };

  const transactions: FinancialExportTransaction[] = [
    ...revenus.filter((revenu) => (!householdId || revenu.householdId === householdId) && isInRange(revenu.dateReception)).map((revenu) => ({
      id: `income:${revenu.id}`,
      kind: "income" as const,
      date: revenu.dateReception,
      description: revenu.description,
      category: revenueCategoryLabel(revenu.categorie),
      amount: Number(revenu.montant) || 0,
    })),
    ...charges
      .filter((charge) => (!householdId || charge.householdId === householdId) && charge.nature === "depense" && isInRange(charge.dateStatistiques))
      .map((charge) => ({
        id: `expense:${charge.id}`,
        kind: "expense" as const,
        date: charge.dateStatistiques,
        description: charge.description,
        category: chargeCategoryLabel(charge.categorie),
        amount: Number(charge.montantTotal) || 0,
      })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  const months = new Map<string, FinancialExportMonth>();
  transactions.forEach((transaction) => {
    const key = dayjs(transaction.date).format("YYYY-MM");
    const current = months.get(key) ?? {
      key,
      label: dayjs(transaction.date).locale("fr").format("MMMM YYYY").toUpperCase(),
      transactions: [],
      incomes: 0,
      expenses: 0,
      balance: 0,
    };
    current.transactions.push(transaction);
    if (transaction.kind === "income") current.incomes += transaction.amount;
    else current.expenses += transaction.amount;
    current.balance = current.incomes - current.expenses;
    months.set(key, current);
  });

  const groupedMonths = Array.from(months.values());
  const totals = groupedMonths.reduce(
    (total, month) => ({
      incomes: total.incomes + month.incomes,
      expenses: total.expenses + month.expenses,
      balance: total.balance + month.balance,
    }),
    { incomes: 0, expenses: 0, balance: 0 },
  );
  return { transactions, months: groupedMonths, totals };
};

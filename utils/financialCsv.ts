import Papa from "papaparse";
import dayjs from "dayjs";
import { FinancialExportTransaction } from "./financialExport";

const formatAmount = (amount: number) => amount
  .toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  .replace(/\u202f/g, " ");

/** Builds Excel-friendly semicolon-separated data from the normalized export model. */
export const buildFinancialTransactionsCsv = (transactions: FinancialExportTransaction[]) => {
  const rows = transactions.map((transaction) => {
    const signedPersonalAmount = transaction.kind === "expense"
      ? -transaction.amount
      : transaction.amount;
    return {
      Date: dayjs(transaction.date).format("DD/MM/YYYY"),
      Description: transaction.description,
      "Catégorie": transaction.category,
      Type: transaction.kind === "income" ? "Revenu" : "Dépense",
      "Montant total": formatAmount(transaction.isShared ? transaction.totalAmount ?? transaction.amount : transaction.amount),
      "Montant personnel": `${signedPersonalAmount >= 0 ? "+" : "-"}${formatAmount(Math.abs(signedPersonalAmount))}`,
      Payeur: transaction.isShared ? transaction.payerName ?? "" : "",
      "Partagée": transaction.isShared ? "Oui" : "Non",
    };
  });

  return `\uFEFF${Papa.unparse(rows, { delimiter: ";", newline: "\r\n" })}`;
};

export const downloadFinancialTransactionsCsv = (transactions: FinancialExportTransaction[]) => {
  const csv = buildFinancialTransactionsCsv(transactions);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fynduo-transactions-${dayjs().format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

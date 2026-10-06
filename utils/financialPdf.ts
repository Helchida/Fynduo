import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import { FinancialExportMonth, formatEuro } from "./financialExport";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;

export const downloadFinancialTransactionsPdf = ({
  months,
  totals,
  titlePeriod,
}: {
  months: FinancialExportMonth[];
  totals: { incomes: number; expenses: number; balance: number };
  titlePeriod: string;
}) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;
  const ensureSpace = (height: number) => {
    if (y + height <= PAGE_HEIGHT - MARGIN) return;
    pdf.addPage();
    y = 18;
  };
  const line = (text: string, x: number, width: number, options: Record<string, unknown> = {}) => {
    const lines = pdf.splitTextToSize(text, width);
    pdf.text(lines, x, y, options as any);
    return Math.max(5, lines.length * 4.5);
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.text("Fynduo", MARGIN, y);
  y += 8;
  pdf.setFontSize(13);
  pdf.text("Revenus et dépenses", MARGIN, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(titlePeriod, MARGIN, y);
  y += 10;

  months.forEach((month) => {
    ensureSpace(26);
    pdf.setFillColor(34, 74, 110);
    pdf.rect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(month.label, MARGIN + 4, y + 5.5);
    pdf.setTextColor(0, 0, 0);
    y += 13;
    pdf.setFontSize(8);
    pdf.text("Date", MARGIN, y);
    pdf.text("Libellé", MARGIN + 25, y);
    pdf.text("Catégorie", MARGIN + 105, y);
    pdf.text("Montant", PAGE_WIDTH - MARGIN, y, { align: "right" });
    y += 4;
    pdf.setDrawColor(190);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 5;

    pdf.setFont("helvetica", "normal");
    month.transactions.forEach((transaction) => {
      const rowHeight = Math.max(
        pdf.splitTextToSize(transaction.description || "—", 74).length * 4.5,
        pdf.splitTextToSize(transaction.category || "—", 50).length * 4.5,
        5,
      );
      ensureSpace(rowHeight + 2);
      pdf.setFontSize(8);
      pdf.text(dayjs(transaction.date).format("DD/MM/YYYY"), MARGIN, y);
      line(transaction.description || "—", MARGIN + 25, 74);
      const categoryLines = pdf.splitTextToSize(transaction.category || "—", 50);
      pdf.text(categoryLines, MARGIN + 105, y);
      pdf.text(
        formatEuro(transaction.amount, transaction.kind === "income" ? "+" : "-"),
        PAGE_WIDTH - MARGIN,
        y,
        { align: "right" },
      );
      y += rowHeight + 2;
    });

    ensureSpace(22);
    pdf.setDrawColor(190);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Total revenus", MARGIN + 90, y);
    pdf.text(formatEuro(month.incomes, "+"), PAGE_WIDTH - MARGIN, y, { align: "right" });
    y += 5;
    pdf.text("Total dépenses", MARGIN + 90, y);
    pdf.text(formatEuro(month.expenses, "-"), PAGE_WIDTH - MARGIN, y, { align: "right" });
    y += 5;
    pdf.text("Solde", MARGIN + 90, y);
    pdf.text(formatEuro(month.balance, month.balance >= 0 ? "+" : "-"), PAGE_WIDTH - MARGIN, y, { align: "right" });
    y += 11;
  });

  ensureSpace(28);
  pdf.setFillColor(236, 243, 249);
  pdf.rect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 27, "F");
  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("TOTAL DE LA PÉRIODE", MARGIN + 4, y);
  y += 6;
  pdf.setFontSize(9);
  pdf.text(`Revenus : ${formatEuro(totals.incomes, "+")}`, MARGIN + 4, y);
  y += 5;
  pdf.text(`Dépenses : ${formatEuro(totals.expenses, "-")}`, MARGIN + 4, y);
  y += 5;
  pdf.text(`Solde : ${formatEuro(totals.balance, totals.balance >= 0 ? "+" : "-")}`, MARGIN + 4, y);

  pdf.save(`fynduo-transactions-${dayjs().format("YYYY-MM-DD")}.pdf`);
};

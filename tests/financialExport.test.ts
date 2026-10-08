import { buildFinancialExport, formatEuro, validateExportRange } from "../utils/financialExport";
import { buildFinancialTransactionsCsv } from "../utils/financialCsv";

const revenue = (id: string, dateReception: string, montant: number, householdId = "home") => ({
  id, householdId, dateReception, montant, description: `Revenu ${id}`, categorie: "salary", beneficiaire: "user", moisAnnee: "2026-08", isReferencePay: false,
});
const charge = (id: string, dateStatistiques: string, montantTotal: number, householdId = "home") => ({
  id, householdId, dateStatistiques, montantTotal, description: `Dépense ${id}`, categorie: "food", payeur: "user", beneficiaires: ["user"], moisAnnee: "2026-08", type: "variable" as const, scope: "solo" as const, nature: "depense" as const,
});

describe("financial PDF export data", () => {
  const options = {
    revenus: [revenue("r1", "2026-08-01", 1500), revenue("r2", "2026-09-30", 1600), revenue("foreign", "2026-08-10", 999, "other")],
    charges: [charge("c1", "2026-08-04", 100), charge("c2", "2026-09-20", 400), charge("foreign", "2026-08-11", 900, "other")],
    revenueCategoryLabel: () => "Salaire",
    chargeCategoryLabel: () => "Alimentation",
    householdId: "home",
    currentUserId: "user",
    payerName: (id: string) => id === "payer" ? "Morgan" : id,
  };

  it("exports all selected-household transactions grouped chronologically by month", () => {
    const result = buildFinancialExport(options);
    expect(result.transactions.map((transaction) => transaction.id)).toEqual(["income:r1", "expense:c1", "expense:c2", "income:r2"]);
    expect(result.months.map((month) => month.key)).toEqual(["2026-08", "2026-09"]);
    expect(result.months[0]).toMatchObject({ incomes: 1500, expenses: 100, balance: 1400 });
    expect(result.months[1]).toMatchObject({ incomes: 1600, expenses: 400, balance: 1200 });
    expect(result.totals).toEqual({ incomes: 3100, expenses: 500, balance: 2600 });
  });

  it("uses inclusive date boundaries and omits empty months", () => {
    const result = buildFinancialExport({ ...options, start: new Date("2026-08-01T12:00:00"), end: new Date("2026-09-30T12:00:00") });
    expect(result.transactions.length).toBe(4);
    expect(result.months.length).toBe(2);
    expect(buildFinancialExport({ ...options, start: new Date("2026-08-05"), end: new Date("2026-09-19") }).months).toEqual([]);
  });

  it("formats signs and validates invalid ranges", () => {
    expect(formatEuro(1500, "+")).toBe("+1 500,00 €");
    expect(formatEuro(100, "-")).toBe("-100,00 €");
    expect(validateExportRange()).toBe("Les deux dates sont obligatoires.");
    expect(validateExportRange(new Date("2026-09-02"), new Date("2026-09-01"))?.includes("antérieure")).toBe(true);
  });

  it("uses the persisted distribution for shared expenses without double counting", () => {
    const result = buildFinancialExport({
      ...options,
      charges: [
        charge("personal", "2026-08-04", 50),
        { ...charge("shared", "2026-08-05", 30), scope: "partage" as const, payeur: "payer", beneficiaires: ["user", "payer"], repartition: { user: 10, payer: 20 } },
        { ...charge("not-involved", "2026-08-06", 40), scope: "partage" as const, payeur: "someone", beneficiaires: ["someone"], repartition: { someone: 40 } },
      ],
    });

    expect(result.transactions.map((transaction) => transaction.amount)).toEqual([1500, 50, 10, 1600]);
    expect(result.transactions.find((transaction) => transaction.id === "expense:shared")).toMatchObject({ isShared: true, totalAmount: 30, userShare: 10, payerName: "Morgan" });
    expect(result.totals.expenses).toBe(60);
  });

  it("creates an Excel-friendly CSV from the normalized transactions", () => {
    const result = buildFinancialExport({
      ...options,
      charges: [{ ...charge("shared", "2026-08-05", 30), scope: "partage" as const, payeur: "payer", beneficiaires: ["user", "payer"], repartition: { user: 15, payer: 15 } }],
    });
    const csv = buildFinancialTransactionsCsv(result.transactions);
    expect(csv.startsWith("\uFEFFDate;Description;Catégorie;Type;Montant total;Montant personnel;Payeur;Partagée")).toBe(true);
    expect(csv.includes("30,00;-15,00;Morgan;Oui")).toBe(true);
  });
});

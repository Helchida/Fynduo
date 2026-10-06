import { buildFinancialExport, formatEuro, validateExportRange } from "../utils/financialExport";

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
});

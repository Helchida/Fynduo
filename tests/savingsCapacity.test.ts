import {
  calculateSavingsCapacity,
  getBankTransferableTotals,
} from "../utils/savingsCapacity";

const income = (montant: number, isNonTransferable = false) => ({
  id: `income-${montant}`,
  householdId: "user",
  categorie: "salary",
  description: "Income",
  montant,
  beneficiaire: "user",
  dateReception: "2026-10-01",
  moisAnnee: "2026-10",
  isReferencePay: false,
  isNonTransferable,
});

const expense = (montantTotal: number, isNonTransferable = false) => ({
  id: `expense-${montantTotal}`,
  householdId: "user",
  categorie: "food",
  description: "Expense",
  montantTotal,
  payeur: "user",
  beneficiaires: ["user"],
  dateStatistiques: "2026-10-02",
  moisAnnee: "2026-10",
  type: "variable" as const,
  scope: "solo" as const,
  nature: "depense" as const,
  isNonTransferable,
});

describe("savings capacity", () => {
  it("uses only real income when there are no savings movements", () => {
    expect(calculateSavingsCapacity(1600, 200, 0)).toBe(1400);
  });

  it("keeps deposits and withdrawals separate from revenue", () => {
    // 1,600 real income - 200 expenses - (+200 - 200 - 100) savings.
    expect(calculateSavingsCapacity(1600, 200, -100)).toBe(1500);
  });

  it("reduces capacity for a deposit without creating new income", () => {
    expect(calculateSavingsCapacity(1600, 200, 200)).toBe(1200);
  });

  it("releases capacity for a withdrawal without creating new income", () => {
    expect(calculateSavingsCapacity(1600, 200, -200)).toBe(1600);
  });

  it("excludes non-transferable income and expenses only from bank capacity", () => {
    const totals = getBankTransferableTotals(
      [income(1500), income(150, true)],
      [expense(500), expense(50, true), expense(200)],
      "user",
      true,
    );
    expect(totals).toEqual({ revenus: 1500, depenses: 700 });
    expect(calculateSavingsCapacity(totals.revenus, totals.depenses, 0)).toBe(
      800,
    );
  });

  it("keeps absent or false flags compatible with the prior calculation", () => {
    const legacyIncome = {
      ...income(1600),
      isNonTransferable: undefined,
    } as any;
    const legacyExpense = {
      ...expense(200),
      isNonTransferable: undefined,
    } as any;
    expect(
      getBankTransferableTotals([legacyIncome], [legacyExpense], "user", true),
    ).toEqual({ revenus: 1600, depenses: 200 });
  });

  it("uses each beneficiary share for a shared transferable expense", () => {
    const shared = {
      ...expense(90),
      beneficiaires: ["user", "other"],
      scope: "partage" as const,
    };
    expect(
      getBankTransferableTotals([income(500)], [shared], "user", true),
    ).toEqual({ revenus: 500, depenses: 45 });
  });
});

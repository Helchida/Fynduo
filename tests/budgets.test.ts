import { getBudgetTotals, parseEuroAmount } from "../utils/budgets";
import { ICharge } from "../types";

const period = { id: "2026-10", start: "2026-10-01", end: "2026-10-31", label: "Octobre", isOpen: true };
const charge = (amount: number, category = "courses", date = "2026-10-10"): ICharge => ({
  id: `${amount}-${date}`, householdId: "home", description: "Dépense", montantTotal: amount,
  payeur: "user", beneficiaires: ["user"], dateStatistiques: date, moisAnnee: "2026-10",
  type: "variable", scope: "solo", nature: "depense", categorie: category,
});

describe("budget calculations", () => {
  it("keeps the initial amount when there are no expenses", () => {
    expect(getBudgetTotals(150, ["courses"], [], period).remainingAmount).toBe(150);
  });

  it("subtracts admissible expenses once", () => {
    expect(getBudgetTotals(150, ["courses"], [charge(35), charge(42)], period).remainingAmount).toBe(73);
  });

  it("allows an exceeded budget", () => {
    expect(getBudgetTotals(150, ["courses"], [charge(35), charge(42), charge(80)], period).remainingAmount).toBe(-7);
  });

  it("includes all selected categories and excludes other periods and refunds", () => {
    const refund = { ...charge(20, "loisirs"), nature: "remboursement" as const };
    expect(getBudgetTotals(200, ["courses", "loisirs"], [charge(35), charge(12, "loisirs"), refund, charge(90, "courses", "2026-11-01")], period).spentAmount).toBe(47);
  });

  it("parses euro amounts with exactly two-decimal precision", () => {
    expect(parseEuroAmount("10,50")).toBe(10.5);
    expect(parseEuroAmount("0,99")).toBe(0.99);
    expect(parseEuroAmount("1234.56")).toBe(1234.56);
    expect(parseEuroAmount("10.999")).toBeNull();
    expect(parseEuroAmount("-1")).toBeNull();
  });

  it("counts only the member share in a personal household", () => {
    const shared = { ...charge(30), beneficiaires: ["owner", "other"] };
    expect(getBudgetTotals(100, ["courses"], [shared], period, { isSoloMode: true, currentUserId: "owner" }).spentAmount).toBe(15);
  });

  it("uses an explicit shared-expense split when it exists", () => {
    const shared = { ...charge(30), beneficiaires: ["owner", "other"], repartition: { owner: 11.11, other: 18.89 } };
    expect(getBudgetTotals(100, ["courses"], [shared], period, { isSoloMode: true, currentUserId: "owner" }).spentAmount).toBe(11.11);
  });
});

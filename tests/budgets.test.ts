import { getBudgetTotals, parseEuroToCents } from "../utils/budgets";
import { ICharge } from "../types";

const period = { id: "2026-10", start: "2026-10-01", end: "2026-10-31", label: "Octobre", isOpen: true };
const charge = (amount: number, category = "courses", date = "2026-10-10"): ICharge => ({
  id: `${amount}-${date}`, householdId: "home", description: "Dépense", montantTotal: amount,
  payeur: "user", beneficiaires: ["user"], dateStatistiques: date, moisAnnee: "2026-10",
  type: "variable", scope: "solo", nature: "depense", categorie: category,
});

describe("budget calculations", () => {
  it("keeps the initial amount when there are no expenses", () => {
    expect(getBudgetTotals(15000, ["courses"], [], period).remainingAmountCents).toBe(15000);
  });

  it("subtracts admissible expenses once", () => {
    expect(getBudgetTotals(15000, ["courses"], [charge(35), charge(42)], period).remainingAmountCents).toBe(7300);
  });

  it("allows an exceeded budget", () => {
    expect(getBudgetTotals(15000, ["courses"], [charge(35), charge(42), charge(80)], period).remainingAmountCents).toBe(-700);
  });

  it("includes all selected categories and excludes other periods and refunds", () => {
    const refund = { ...charge(20, "loisirs"), nature: "remboursement" as const };
    expect(getBudgetTotals(20000, ["courses", "loisirs"], [charge(35), charge(12, "loisirs"), refund, charge(90, "courses", "2026-11-01")], period).spentAmountCents).toBe(4700);
  });

  it("parses cents without floating point drift", () => {
    expect(parseEuroToCents("0,1")).toBe(10);
    expect(parseEuroToCents("-1")).toBeNull();
  });

  it("counts only the member share in a personal household", () => {
    const shared = { ...charge(30), beneficiaires: ["owner", "other"] };
    expect(getBudgetTotals(10000, ["courses"], [shared], period, { isSoloMode: true, currentUserId: "owner" }).spentAmountCents).toBe(1500);
  });
});

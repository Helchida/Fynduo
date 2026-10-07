import {
  FinancialPeriod,
  formatFinancialPeriodLabel,
  isDateInFinancialPeriod,
} from "../utils/financialPeriods";

const augustPayPeriod: FinancialPeriod = {
  id: "period-august",
  start: "2026-08-12",
  end: "2026-09-13",
  label: "12 août → 13 sept.",
  isOpen: false,
};

describe("persisted savings pay periods", () => {
  it("uses persisted bounds rather than reconstructing a month", () => {
    expect(isDateInFinancialPeriod("2026-08-12", augustPayPeriod)).toBe(true);
    expect(isDateInFinancialPeriod("2026-09-13", augustPayPeriod)).toBe(true);
    expect(isDateInFinancialPeriod("2026-08-11", augustPayPeriod)).toBe(false);
    expect(isDateInFinancialPeriod("2026-09-14", augustPayPeriod)).toBe(false);
  });

  it("keeps an open period readable without inventing an end date", () => {
    expect(formatFinancialPeriodLabel("2026-10-12", null).endsWith("→ en cours")).toBe(true);
  });

  it("does not attach data when no pay period has been configured", () => {
    expect(isDateInFinancialPeriod("2026-10-11", null)).toBe(false);
  });
});

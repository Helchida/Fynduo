import {
  getCalendarPeriod,
  getCurrentFinancialPeriod,
  getAvailablePayPeriods,
  getFinancialPeriodForDate,
  getPayPeriods,
} from "../utils/financialPeriods";

describe("financial periods", () => {
  const paydays = ["2026-09-28", "2026-10-27", "2026-11-26"];

  it("preserves calendar-month boundaries", () => {
    expect(getCalendarPeriod("2026-12-31")).toMatchObject({
      start: "2026-12-01",
      end: "2026-12-31",
      id: "2026-12",
    });
    expect(getCalendarPeriod("2027-01-01").start).toBe("2027-01-01");
  });

  it("does not create a pay period without an explicit reference pay", () => {
    expect(getPayPeriods([])).toEqual([]);
    expect(getCurrentFinancialPeriod("PAY_PERIOD", [], "2026-10-10")).toBeNull();
  });

  it("ignores normal income unless it is explicitly marked as a reference pay", () => {
    const revenus = [
      { date: "2026-09-28", isReferencePay: true },
      { date: "2026-10-10", isReferencePay: false },
      { date: "2026-10-27", isReferencePay: true },
    ];
    const referenceDates = revenus
      .filter((revenu) => revenu.isReferencePay)
      .map((revenu) => revenu.date);
    expect(getPayPeriods(referenceDates)).toMatchObject([
      { start: "2026-09-28", end: "2026-10-26" },
      { start: "2026-10-27", end: null },
    ]);
  });

  it("keeps a single reference-pay period open", () => {
    expect(getPayPeriods(["2026-09-28"])).toEqual([
      expect.objectContaining({ start: "2026-09-28", end: null, isOpen: true }),
    ]);
  });

  it("uses the next real payday, never a fixed day count", () => {
    expect(getPayPeriods(paydays)).toMatchObject([
      { start: "2026-09-28", end: "2026-10-26", isOpen: false },
      { start: "2026-10-27", end: "2026-11-25", isOpen: false },
      { start: "2026-11-26", end: null, isOpen: true },
    ]);
  });

  it("generates one selector entry per reference-pay period, independently of savings operations", () => {
    const savingsOperations = [
      { date: "2026-09-29", tirelireId: "a" },
      { date: "2026-10-10", tirelireId: "a" },
      { date: "2026-10-26", tirelireId: "b" },
      { date: "2026-10-30", tirelireId: "b" },
    ];

    expect(savingsOperations.length).toBe(4);
    expect(getAvailablePayPeriods(paydays, "2026-11-30").map((period) => period.id)).toEqual([
      "2026-09-28",
      "2026-10-27",
      "2026-11-26",
    ]);
  });

  it("keeps one calendar selector identity for all operations in the same month", () => {
    const periodIds = ["2026-10-01", "2026-10-15", "2026-10-31"].map(
      (date) => getCalendarPeriod(date).id,
    );
    expect(Array.from(new Set(periodIds))).toEqual(["2026-10"]);
  });

  it("applies inclusive start/end boundaries", () => {
    expect(getFinancialPeriodForDate("PAY_PERIOD", paydays, "2026-09-27")).toBeNull();
    expect(getFinancialPeriodForDate("PAY_PERIOD", paydays, "2026-09-28")?.start).toBe("2026-09-28");
    expect(getFinancialPeriodForDate("PAY_PERIOD", paydays, "2026-10-26")?.start).toBe("2026-09-28");
    expect(getFinancialPeriodForDate("PAY_PERIOD", paydays, "2026-10-27")?.start).toBe("2026-10-27");
    expect(getFinancialPeriodForDate("PAY_PERIOD", paydays, "2026-11-25")?.start).toBe("2026-10-27");
    expect(getFinancialPeriodForDate("PAY_PERIOD", paydays, "2026-11-26")?.start).toBe("2026-11-26");
  });

  it("handles year transitions and leap-year February", () => {
    const periods = getPayPeriods(["2023-12-29", "2024-02-29", "2024-03-28"]);
    expect(periods[0].end).toBe("2024-02-28");
    expect(periods[1].end).toBe("2024-03-27");
  });
});

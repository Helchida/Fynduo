import {
  formatCalendarMonth,
  getSavingsMovementDisplayDate,
} from "../utils/calendarDate";

describe("savings movement calendar labels", () => {
  it("uses the stored calendar date rather than converting its timezone", () => {
    expect(formatCalendarMonth("2026-11-03T00:00:00.000Z")).toBe(
      "novembre 2026",
    );
  });

  it("keeps year boundaries on their actual calendar month", () => {
    expect(formatCalendarMonth("2026-12-31")).toBe("décembre 2026");
    expect(formatCalendarMonth("2027-01-01")).toBe("janvier 2027");
  });

  it("returns the exact stored movement date", () => {
    expect(getSavingsMovementDisplayDate("2026-10-03")).toBe("2026-10-03");
  });

  it("slices correctly long date-time strings to keep only the calendar date", () => {
    expect(getSavingsMovementDisplayDate("2026-11-08T14:22:10.000Z")).toBe(
      "2026-11-08",
    );
  });
});

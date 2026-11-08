import {
  formatCalendarMonth,
  getSavingsMovementDisplayDate,
} from "../utils/calendarDate";
import dayjs from "dayjs";

describe("savings movement calendar labels", () => {
  it("uses the stored calendar date rather than converting its timezone", () => {
    expect(formatCalendarMonth("2026-11-03T00:00:00.000Z")).toBe("novembre 2026");
  });

  it("keeps year boundaries on their actual calendar month", () => {
    expect(formatCalendarMonth("2026-12-31")).toBe("décembre 2026");
    expect(formatCalendarMonth("2027-01-01")).toBe("janvier 2027");
  });

  it("labels a completed savings period with its actual end date", () => {
    expect(
      getSavingsMovementDisplayDate("2026-10-03", {
        endDate: "2026-11-11",
      }),
    ).toBe("2026-11-11");
  });

  it("labels an open savings period with the local current date", () => {
    expect(
      getSavingsMovementDisplayDate(
        "2026-10-03",
        { endDate: null },
        dayjs("2026-11-08T12:00:00"),
      ),
    ).toBe("2026-11-08");
  });
});

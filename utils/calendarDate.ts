import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

/**
 * Formats a calendar date without letting a UTC conversion move it into the
 * previous/next local day.
 */
export const formatCalendarMonth = (value: string) =>
  dayjs(value.slice(0, 10)).format("MMMM YYYY");

export const formatCalendarDate = (value: string, format: string) =>
  dayjs(value.slice(0, 10)).format(format);

/**
 * The movement keeps its real operation date. Its UI label, however, follows
 * the associated financial period: completed periods end on `endDate` and an
 * open period is labelled with the user's current local date.
 */
export const getSavingsMovementDisplayDate = (
  movementDate: string,
  financialPeriod?: { endDate: string | null } | null,
  now: dayjs.Dayjs = dayjs(),
) => {
  if (!financialPeriod) return movementDate.slice(0, 10);
  return financialPeriod.endDate ?? now.format("YYYY-MM-DD");
};

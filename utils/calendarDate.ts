import dayjs from "dayjs";

/**
 * Formats the calendar date recorded by the database without letting a UTC
 * conversion move it into the previous/next local day. Savings movements are
 * business-date records; their financial-period relation is separate.
 */
export const formatCalendarMonth = (value: string) =>
  dayjs(value.slice(0, 10)).format("MMMM YYYY");

export const formatCalendarDate = (value: string, format: string) =>
  dayjs(value.slice(0, 10)).format(format);

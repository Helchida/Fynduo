import dayjs from "dayjs";

export type FinancialPeriodMode = "CALENDAR_MONTH" | "PAY_PERIOD";

export interface FinancialPeriod {
  /** Stable identifier. For pay periods this is the reference pay date. */
  id: string;
  start: string;
  end: string | null;
  label: string;
  isOpen: boolean;
  mode: FinancialPeriodMode;
}

const DATE_FORMAT = "YYYY-MM-DD";

/**
 * Converts the application's timestamp/date values to their local calendar day.
 * All period comparisons deliberately happen at day granularity.
 */
export const toFinancialDate = (value: string | Date | dayjs.Dayjs): string =>
  dayjs(value).format(DATE_FORMAT);

const formatRangeLabel = (start: string, end: string | null) => {
  const startDate = dayjs(start);
  const startLabel = startDate.format("D MMM");

  if (!end) return `${startLabel} → en cours`;

  const endDate = dayjs(end);
  return startDate.year() === endDate.year()
    ? `${startLabel} → ${endDate.format("D MMM")}`
    : `${startLabel} ${startDate.format("YYYY")} → ${endDate.format("D MMM YYYY")}`;
};

export const getCalendarPeriod = (
  date: string | Date | dayjs.Dayjs = dayjs(),
): FinancialPeriod => {
  const month = dayjs(date).startOf("month");
  return {
    id: month.format("YYYY-MM"),
    start: month.format(DATE_FORMAT),
    end: month.endOf("month").format(DATE_FORMAT),
    label: month.format("MMMM YYYY"),
    isOpen: false,
    mode: "CALENDAR_MONTH",
  };
};

/** Returns unique, chronologically sorted pay dates. Multiple payments on the
 * same calendar date mark one boundary, never an empty period. */
export const getReferencePayDates = (referencePayDates: Array<string | Date>) =>
  Array.from(new Set(referencePayDates.map(toFinancialDate))).sort((a, b) =>
    a.localeCompare(b),
  );

export const getPayPeriods = (
  referencePayDates: Array<string | Date>,
): FinancialPeriod[] => {
  const dates = getReferencePayDates(referencePayDates);
  return dates.map((start, index) => {
    const nextStart = dates[index + 1];
    const end = nextStart
      ? dayjs(nextStart).subtract(1, "day").format(DATE_FORMAT)
      : null;

    return {
      id: start,
      start,
      end,
      label: formatRangeLabel(start, end),
      isOpen: end === null,
      mode: "PAY_PERIOD",
    };
  });
};

/**
 * Periods that can be selected in a UI as of a given day. This deliberately
 * depends only on reference-pay boundaries, never on the transactions that
 * happen to fall inside a period.
 */
export const getAvailablePayPeriods = (
  referencePayDates: Array<string | Date>,
  asOf: string | Date | dayjs.Dayjs = dayjs(),
): FinancialPeriod[] => {
  const currentDay = toFinancialDate(asOf);
  return getPayPeriods(referencePayDates).filter(
    (period) => period.start <= currentDay,
  );
};

export const getFinancialPeriodForDate = (
  mode: FinancialPeriodMode,
  referencePayDates: Array<string | Date>,
  date: string | Date | dayjs.Dayjs,
): FinancialPeriod | null => {
  if (mode === "CALENDAR_MONTH") return getCalendarPeriod(date);

  const day = toFinancialDate(date);
  // A transaction prior to the first known reference pay belongs to no
  // pay-defined period. We intentionally do not invent a prior boundary.
  return (
    getPayPeriods(referencePayDates).find(
      (period) => day >= period.start && (!period.end || day <= period.end),
    ) ?? null
  );
};

export const getCurrentFinancialPeriod = (
  mode: FinancialPeriodMode,
  referencePayDates: Array<string | Date>,
  now: string | Date | dayjs.Dayjs = dayjs(),
): FinancialPeriod | null =>
  getFinancialPeriodForDate(mode, referencePayDates, now);

export const isDateInFinancialPeriod = (
  date: string | Date | dayjs.Dayjs,
  period: FinancialPeriod | null,
) => {
  if (!period) return false;
  const day = toFinancialDate(date);
  return day >= period.start && (!period.end || day <= period.end);
};

export const filterByFinancialPeriod = <T>(
  values: T[],
  getDate: (value: T) => string,
  period: FinancialPeriod | null,
) => values.filter((value) => isDateInFinancialPeriod(getDate(value), period));

export const getPeriodLabel = (period: FinancialPeriod | null) =>
  period?.label ?? "Aucune période de paie";

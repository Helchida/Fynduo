import dayjs from "dayjs";

export interface FinancialPeriod {
  /** Persisted ledger identifier; never derived from a date in the UI. */
  id: string;
  start: string;
  end: string | null;
  label: string;
  isOpen: boolean;
  isHistorical?: boolean;
  isEditable?: boolean;
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

export const formatFinancialPeriodLabel = formatRangeLabel;

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

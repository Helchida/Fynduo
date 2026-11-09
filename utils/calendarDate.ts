import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

export const formatCalendarMonth = (value: string) =>
  dayjs(value.slice(0, 10)).format("MMMM YYYY");

export const formatCalendarDate = (value: string, format: string) =>
  dayjs(value.slice(0, 10)).format(format);

export const getSavingsMovementDisplayDate = (movementDate: string) => {
  return movementDate.slice(0, 10);
};

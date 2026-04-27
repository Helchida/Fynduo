import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { IChargeFixeTemplate } from "../types";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const DAY_NAMES = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const POSITION_LABELS: Record<number, string> = {
  1: "premier", 2: "deuxième", 3: "troisième", 4: "quatrième", [-1]: "dernier",
};

export function getPeriodiciteLabel(config: IChargeFixeTemplate): string {
  const { periodiciteType, periodiciteIntervalle: n, jourNommeConfig } = config;

  switch (periodiciteType) {
    case "journalier":    return n === 1 ? "Tous les jours" : `Tous les ${n} jours`;
    case "hebdomadaire":  return n === 1 ? "Toutes les semaines" : `Toutes les ${n} semaines`;
    case "mensuel":       return n === 1 ? "Tous les mois" : `Tous les ${n} mois`;
    case "annuel":        return n === 1 ? "Tous les ans" : `Tous les ${n} ans`;
    case "echeancier":    return "Échéancier personnalisé";
    case "jour_nomme": {
      if (!jourNommeConfig) return "Jour nommé";
      const pos = POSITION_LABELS[jourNommeConfig.position] ?? jourNommeConfig.position;
      const day = DAY_NAMES[jourNommeConfig.dayOfWeek];
      return `Le ${pos} ${day} du mois`;
    }
    default: return periodiciteType;
  }
}

const MONTH_NAMES = [
  "janvier","février","mars","avril","mai","juin",
  "juillet","août","septembre","octobre","novembre","décembre",
];

export function getPeriodiciteDetailLabel(config: IChargeFixeTemplate): string {
  const {
    periodiciteType,
    periodiciteIntervalle: n,
    datePremierPrelevement,
    jourNommeConfig,
    echeancier,
  } = config;

  const anchor = datePremierPrelevement ? dayjs(datePremierPrelevement) : null;

  switch (periodiciteType) {
    case "journalier":
      return n === 1 ? "Tous les jours" : `Tous les ${n} jours`;

    case "hebdomadaire": {
      const base = n === 1 ? "Toutes les semaines" : `Toutes les ${n} semaines`;
      if (!anchor) return base;
      return `${base} · le ${DAY_NAMES[anchor.day()]}`;
    }

    case "mensuel": {
      const base = n === 1 ? "Tous les mois" : `Tous les ${n} mois`;
      if (!anchor) return base;
      return `${base} · le ${anchor.date()}`;
    }

    case "annuel": {
      const base = n === 1 ? "Tous les ans" : `Tous les ${n} ans`;
      if (!anchor) return base;
      return `${base} · le ${anchor.date()} ${MONTH_NAMES[anchor.month()]}`;
    }

    case "jour_nomme": {
      if (!jourNommeConfig) return "Jour nommé";
      const pos = POSITION_LABELS[jourNommeConfig.position] ?? jourNommeConfig.position;
      const day = DAY_NAMES[jourNommeConfig.dayOfWeek];
      return `Le ${pos} ${day} du mois`;
    }

    case "echeancier": {
      const count = echeancier?.length ?? 0;
      return count > 0
        ? `Échéancier · ${count} date${count > 1 ? "s" : ""}`
        : "Échéancier personnalisé";
    }

    default:
      return periodiciteType;
  }
}

export function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, position: number): Dayjs {
  const firstDay = dayjs(new Date(year, month, 1));
  const lastDay  = dayjs(new Date(year, month + 1, 0));

  if (position === -1) {
    let d = lastDay;
    while (d.day() !== dayOfWeek) d = d.subtract(1, "day");
    return d;
  }

  let count = 0;
  let d = firstDay;
  while (d.month() === month) {
    if (d.day() === dayOfWeek) {
      count++;
      if (count === position) return d;
    }
    d = d.add(1, "day");
  }
  return lastDay;
}

export function getAllScheduledDates(
  config: IChargeFixeTemplate,
  from: Dayjs,
  to: Dayjs,
): Dayjs[] {
  const { periodiciteType, periodiciteIntervalle: n, datePremierPrelevement, dateFin, echeancier, jourNommeConfig } = config;

  const effectiveTo = dateFin
    ? dayjs(dateFin).startOf("day").isBefore(to, "day")
      ? dayjs(dateFin).startOf("day")
      : to
    : to;

  if (effectiveTo.isBefore(from, "day")) return [];

  const anchor = datePremierPrelevement
    ? dayjs(datePremierPrelevement).startOf("day")
    : null;

  const results: Dayjs[] = [];

  switch (periodiciteType) {
    case "echeancier": {
      if (!echeancier) return [];
      for (const entry of echeancier) {
        const d = dayjs(entry.date).startOf("day");
        if (!d.isBefore(from, "day") && !d.isAfter(effectiveTo, "day")) {
          results.push(d);
        }
      }
      return results;
    }

    case "journalier": {
      if (!anchor) return [];
      if (anchor.isAfter(effectiveTo, "day")) return [];
      const diffDays = from.diff(anchor, "day");
      if (diffDays < 0) {
        let d = anchor;
        while (!d.isAfter(effectiveTo, "day")) {
          if (!d.isBefore(from, "day")) results.push(d);
          d = d.add(n, "day");
        }
      } else {
        const stepsNeeded = Math.floor(diffDays / n);
        let d = anchor.add(stepsNeeded * n, "day");
        if (d.isBefore(from, "day")) d = d.add(n, "day");
        while (!d.isAfter(effectiveTo, "day")) {
          results.push(d);
          d = d.add(n, "day");
        }
      }
      return results;
    }

    case "hebdomadaire": {
      if (!anchor) return [];
      if (anchor.isAfter(effectiveTo, "day")) return [];
      const diffWeeks = from.diff(anchor, "week");
      if (diffWeeks < 0) {
        let d = anchor;
        while (!d.isAfter(effectiveTo, "day")) {
          if (!d.isBefore(from, "day")) results.push(d);
          d = d.add(n, "week");
        }
      } else {
        const stepsNeeded = Math.floor(diffWeeks / n);
        let d = anchor.add(stepsNeeded * n, "week");
        if (d.isBefore(from, "day")) d = d.add(n, "week");
        while (!d.isAfter(effectiveTo, "day")) {
          results.push(d);
          d = d.add(n, "week");
        }
      }
      return results;
    }

    case "mensuel": {
      if (!anchor) return [];
      if (anchor.isAfter(effectiveTo, "day")) return [];
      const diffMonths = Math.max(0, from.diff(anchor, "month"));
      const stepsNeeded = Math.floor(diffMonths / n);
      let d = anchor.add(stepsNeeded * n, "month");
      if (d.isBefore(from, "day")) d = d.add(n, "month");
      while (!d.isAfter(effectiveTo, "day")) {
        results.push(d);
        d = d.add(n, "month");
      }
      return results;
    }

    case "annuel": {
      if (!anchor) return [];
      if (anchor.isAfter(effectiveTo, "day")) return [];
      const diffYears = Math.max(0, from.diff(anchor, "year"));
      const stepsNeeded = Math.floor(diffYears / n);
      let d = anchor.add(stepsNeeded * n, "year");
      if (d.isBefore(from, "day")) d = d.add(n, "year");
      while (!d.isAfter(effectiveTo, "day")) {
        results.push(d);
        d = d.add(n, "year");
      }
      return results;
    }

    case "jour_nomme": {
      if (!jourNommeConfig) return [];
      let month = from.startOf("month");
      while (!month.isAfter(effectiveTo, "month")) {
        const target = getNthWeekdayOfMonth(
          month.year(), month.month(),
          jourNommeConfig.dayOfWeek, jourNommeConfig.position,
        );
        if (!target.isBefore(from, "day") && !target.isAfter(effectiveTo, "day")) {
          results.push(target);
        }
        month = month.add(1, "month");
      }
      return results;
    }

    default:
      return [];
  }
}

export function shouldAddChargeToday(
  config: IChargeFixeTemplate,
  existingDescriptions: Set<string>,
  today: Dayjs = dayjs(),
): boolean {
  const dates = getAllScheduledDates(config, today.startOf("day"), today.startOf("day"));
  if (dates.length === 0) return false;
  if (config.periodiciteType !== "echeancier" && existingDescriptions.has(config.description)) return false;
  return true;
}

export function getMontantForToday(config: IChargeFixeTemplate, today: Dayjs = dayjs()): number {
  if (config.periodiciteType === "echeancier" && config.echeancier) {
    const todayStr = today.format("YYYY-MM-DD");
    const entry = config.echeancier.find((e) => e.date === todayStr);
    if (entry) return entry.montant;
  }
  return config.montantTotal;
}
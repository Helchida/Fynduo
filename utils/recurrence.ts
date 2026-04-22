import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { IChargeFixeTemplate } from "../types";

dayjs.extend(isSameOrBefore);

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

function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, position: number): Dayjs {
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

export function shouldAddChargeToday(
  config: IChargeFixeTemplate,
  existingDescriptions: Set<string>,
  today: Dayjs = dayjs(),
): boolean {
  const { periodiciteType, periodiciteIntervalle: n, datePremierPrelevement, dateFin, echeancier, jourNommeConfig } = config;

  if (dateFin && today.isAfter(dayjs(dateFin), "day")) return false;

  if (periodiciteType !== "echeancier" && existingDescriptions.has(config.description)) return false;

  const anchor = datePremierPrelevement ? dayjs(datePremierPrelevement) : null;

  switch (periodiciteType) {
    case "journalier": {
      if (!anchor) return false;
      const diff = today.diff(anchor, "day");
      return diff >= 0 && diff % n === 0;
    }

    case "hebdomadaire": {
      if (!anchor) return false;
      const diff = today.diff(anchor, "week");
      return diff >= 0 && diff % n === 0 && today.isSame(anchor.add(diff, "week"), "day");
    }

    case "mensuel": {
      if (!anchor) return false;
      const monthDiff = today.diff(anchor, "month");
      if (monthDiff < 0 || monthDiff % n !== 0) return false;
      return today.date() === anchor.date();
    }

    case "annuel": {
      if (!anchor) return false;
      const yearDiff = today.diff(anchor, "year");
      if (yearDiff < 0 || yearDiff % n !== 0) return false;
      return today.month() === anchor.month() && today.date() === anchor.date();
    }

    case "jour_nomme": {
      if (!jourNommeConfig) return false;
      const target = getNthWeekdayOfMonth(
        today.year(), today.month(),
        jourNommeConfig.dayOfWeek,
        jourNommeConfig.position,
      );
      return today.isSame(target, "day");
    }

    case "echeancier": {
      if (!echeancier) return false;
      const todayStr = today.format("YYYY-MM-DD");
      return echeancier.some((e) => e.date === todayStr);
    }

    default:
      return false;
  }
}

export function getMontantForToday(config: IChargeFixeTemplate, today: Dayjs = dayjs()): number {
  if (config.periodiciteType === "echeancier" && config.echeancier) {
    const todayStr = today.format("YYYY-MM-DD");
    const entry = config.echeancier.find((e) => e.date === todayStr);
    if (entry) return entry.montant;
  }
  return config.montantTotal;
}
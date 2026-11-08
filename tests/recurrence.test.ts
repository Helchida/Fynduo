import dayjs from "dayjs";
import { IChargeFixeTemplate } from "../types";
import { shouldAddChargeToday } from "../utils/recurrence";

const configFor = (datePremierPrelevement: string): IChargeFixeTemplate => ({
  id: "fixed-charge-1",
  householdId: "household-1",
  categorie: "cat_logement",
  description: "Internet",
  montantTotal: 30,
  payeur: "user-1",
  beneficiaires: ["user-1"],
  scope: "solo",
  periodiciteType: "mensuel",
  periodiciteIntervalle: 1,
  datePremierPrelevement,
});

describe("fixed-charge automatic generation", () => {
  const today = dayjs("2026-11-08");

  it("only considers a configuration due when its scheduled date is today", () => {
    expect(shouldAddChargeToday(configFor("2026-11-03"), new Set(), today)).toBe(false);
    expect(shouldAddChargeToday(configFor("2026-11-08"), new Set(), today)).toBe(true);
    expect(shouldAddChargeToday(configFor("2026-11-09"), new Set(), today)).toBe(false);
  });

  it("does not generate an already existing recurring charge twice", () => {
    expect(
      shouldAddChargeToday(configFor("2026-11-08"), new Set(["Internet"]), today),
    ).toBe(false);
  });
});

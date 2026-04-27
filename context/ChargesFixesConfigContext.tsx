import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { ICharge, IChargeFixeTemplate } from "../types";
import { useAuth } from "../hooks/useAuth";
import * as DB from "../services/supabase/db";
import dayjs from "dayjs";
import { IChargesFixesConfigContext } from "./types/ChargesFixesConfigContext.type";
import { getAllScheduledDates, getMontantForToday } from "../utils/recurrence";

export const ChargesFixesConfigContext = createContext<
  IChargesFixesConfigContext | undefined
>(undefined);

const BACKFILL_DAYS = 365;

export const ChargesFixesConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, householdUsers, isLoading } = useAuth();
  const activeHouseholdId = user?.activeHouseholdId;
  const isSoloMode = user?.id === activeHouseholdId;
  const [chargesFixesConfigs, setChargesFixesConfigs] = useState<IChargeFixeTemplate[]>(
    [],
  );
  const [isLoadingComptes, setIsLoadingComptes] = useState(false);

  const processingCharges = useRef<Set<string>>(new Set());

  const loadConfigs = useCallback(async () => {
    if (!activeHouseholdId) return;
    setIsLoadingComptes(true);
    try {
      const data = await DB.getChargesFixesConfigs(activeHouseholdId);
      setChargesFixesConfigs(data);
    } catch (error) {
      console.error("Erreur loadConfigs:", error);
    } finally {
      setIsLoadingComptes(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    setChargesFixesConfigs([]);
    if (!isLoading) {
      loadConfigs();
    }
  }, [activeHouseholdId, loadConfigs, isLoading]);

  const handleAutoAddFixedCharges = useCallback(async () => {
    if (isLoading || !activeHouseholdId || !user) return;

    if (!isSoloMode && (!householdUsers || householdUsers.length === 0)) {
      return;
    }

    const freshConfigs = await DB.getChargesFixesConfigs(activeHouseholdId);
    if (freshConfigs.length === 0) return;

    const currentChargesInDB = await DB.getChargesByType(
      activeHouseholdId,
      "fixe",
    );

    const today = dayjs().startOf("day");
    const backfillFrom = today.subtract(BACKFILL_DAYS, "day");
    const beneficiaryUids = isSoloMode
      ? [user.id]
      : householdUsers.map((u) => u.id);

    const existingKeys = new Set<string>(
      currentChargesInDB.map((c) => {
        const dateStr = c.dateStatistiques
          ? dayjs(c.dateStatistiques).format("YYYY-MM-DD")
          : "";
        return `${c.description}:${dateStr}`;
      }),
    );

    for (const config of freshConfigs) {
      let from: dayjs.Dayjs;

      if (config.periodiciteType === "echeancier") {
        from = backfillFrom;
      } else if (config.periodiciteType === "jour_nomme") {
        from = backfillFrom.startOf("month");
      } else {
        if (!config.datePremierPrelevement) continue;
        const anchor = dayjs(config.datePremierPrelevement).startOf("day");
        if (anchor.isAfter(today, "day")) continue;
        from = anchor.isAfter(backfillFrom, "day") ? anchor : backfillFrom;
      }

      const scheduledDates = getAllScheduledDates(config, from, today);

      for (const date of scheduledDates) {
        const dateStr = date.format("YYYY-MM-DD");
        const dedupeKey = `${config.description}:${dateStr}`;
        const processingKey = `${config.id ?? config.description}-${dateStr}`;

        if (existingKeys.has(dedupeKey)) continue;
        if (processingCharges.current.has(processingKey)) continue;

        existingKeys.add(dedupeKey);
        processingCharges.current.add(processingKey);

        try {
          const montant = getMontantForToday(config, date);
          const moisAnnee = date.format("YYYY-MM");

          const nouvelleCharge: Omit<ICharge, "id"> = {
            description: config.description,
            montantTotal: montant,
            payeur: config.payeur,
            beneficiaires: beneficiaryUids,
            dateStatistiques: date.toISOString(),
            moisAnnee,
            categorie: config.categorie,
            type: "fixe",
            scope: beneficiaryUids.length > 1 ? "partage" : "solo",
            householdId: activeHouseholdId,
          };

          await DB.addCharge(activeHouseholdId, nouvelleCharge);
        } catch (error) {
          console.error("Erreur auto-add charge:", error);
          existingKeys.delete(dedupeKey);
          processingCharges.current.delete(processingKey);
        }
      }
    }
  }, [activeHouseholdId, isSoloMode, householdUsers, user, isLoading]);

  const updateChargeFixe = useCallback(
    async (chargeId: string, updates: Partial<IChargeFixeTemplate>) => {
      if (!activeHouseholdId) return;

      await DB.updateChargeFixeConfig(activeHouseholdId, chargeId, updates);

      setChargesFixesConfigs((prev) =>
        prev.map((c) =>
          c.id === chargeId ? { ...c, ...updates } : c
        )
      );
    },
    [activeHouseholdId]
  );

  const addChargeFixeConfig = useCallback(
    async (charge: Omit<IChargeFixeTemplate, "id" | "householdId">) => {
      if (!activeHouseholdId) return;
      await DB.addChargeFixeConfig(activeHouseholdId, charge);
      await loadConfigs();
      await handleAutoAddFixedCharges();
    },
    [activeHouseholdId, loadConfigs, handleAutoAddFixedCharges],
  );

  const deleteChargeFixeConfig = useCallback(
    async (chargeId: string) => {
      if (!activeHouseholdId) return;
      await DB.deleteChargeFixeConfig(activeHouseholdId, chargeId);
      setChargesFixesConfigs((prev) => prev.filter((c) => c.id !== chargeId));
    },
    [activeHouseholdId],
  );

  const value = useMemo(
    () => ({
      isLoadingComptes,
      chargesFixesConfigs,
      loadConfigs,
      handleAutoAddFixedCharges,
      updateChargeFixe,
      addChargeFixeConfig,
      deleteChargeFixeConfig,
    }),
    [
      isLoadingComptes,
      chargesFixesConfigs,
      loadConfigs,
      handleAutoAddFixedCharges,
      updateChargeFixe,
      addChargeFixeConfig,
      deleteChargeFixeConfig,
    ],
  );

  return (
    <ChargesFixesConfigContext.Provider value={value}>
      {children}
    </ChargesFixesConfigContext.Provider>
  );
};
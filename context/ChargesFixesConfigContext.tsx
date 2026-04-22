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
import { shouldAddChargeToday, getMontantForToday } from "../utils/recurrence";

export const ChargesFixesConfigContext = createContext<
  IChargesFixesConfigContext | undefined
>(undefined);

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

    const today = dayjs();
    const currentMoisAnnee = today.format("YYYY-MM");
    const beneficiaryUids = isSoloMode
      ? [user.id]
      : householdUsers.map((u) => u.id);

    const existingThisMonth = new Set(
    currentChargesInDB
      .filter((c) => c.moisAnnee === currentMoisAnnee)
      .map((c) => c.description)
  );

  for (const config of freshConfigs) {
    const chargeKey = `${config.description}-${today.format("YYYY-MM-DD")}`;
    if (processingCharges.current.has(chargeKey)) continue;
    if (!shouldAddChargeToday(config, existingThisMonth, today)) continue;

    processingCharges.current.add(chargeKey);
    try {
      const montant = getMontantForToday(config, today);
      const nouvelleCharge: Omit<ICharge, "id"> = {
        description: config.description,
        montantTotal: montant,
        payeur: config.payeur,
        beneficiaires: beneficiaryUids,
        dateStatistiques: today.toISOString(),
        moisAnnee: currentMoisAnnee,
        categorie: config.categorie,
        type: "fixe",
        scope: beneficiaryUids.length > 1 ? "partage" : "solo",
        householdId: activeHouseholdId,
      };
      await DB.addCharge(activeHouseholdId, nouvelleCharge);
      existingThisMonth.add(config.description);
    } catch (error) {
      console.error("Erreur auto-add charge:", error);
      processingCharges.current.delete(chargeKey);
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
      loadConfigs();
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

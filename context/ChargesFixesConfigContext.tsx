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
    const currentDay = today.date();
    const beneficiaryUids = isSoloMode
      ? [user.id]
      : householdUsers.map((u) => u.id);

    for (const config of freshConfigs) {
      const chargeKey = `${config.description}-${currentMoisAnnee}`;

      if (
        !processingCharges.current.has(chargeKey) &&
        config.jourPrelevementMensuel &&
        currentDay >= config.jourPrelevementMensuel
      ) {
        const alreadyExists = currentChargesInDB.some(
          (c) =>
            c.description === config.description &&
            c.moisAnnee === currentMoisAnnee &&
            c.type === "fixe",
        );

        if (!alreadyExists) {
          processingCharges.current.add(chargeKey);
          try {
            const nouvelleCharge: Omit<ICharge, "id"> = {
              description: config.description,
              montantTotal: config.montantTotal,
              payeur: config.payeur,
              beneficiaires: beneficiaryUids,
              dateComptes: today
                .date(config.jourPrelevementMensuel)
                .toISOString(),
              dateStatistiques: today
                .date(config.jourPrelevementMensuel)
                .toISOString(),
              moisAnnee: currentMoisAnnee,
              categorie: config.categorie,
              type: "fixe",
              scope: beneficiaryUids.length > 1 ? "partage" : "solo",
              householdId: activeHouseholdId,
            };

            await DB.addCharge(activeHouseholdId, nouvelleCharge);
            console.log(`Charge fixe auto-générée : ${config.description}`);
          } catch (error) {
            console.error("Erreur auto-add charge:", error);
            processingCharges.current.delete(chargeKey);
          }
        }
      }
    }
  }, [activeHouseholdId, isSoloMode, householdUsers, user, isLoading]);

  const updateChargeFixeConfig = useCallback(
    async (chargeId: string, newAmount: number) => {
      if (!activeHouseholdId) return;
      await DB.updateChargeFixeConfig(activeHouseholdId, chargeId, {
        montantTotal: newAmount,
      });
      setChargesFixesConfigs((prev) =>
        prev.map((c) =>
          c.id === chargeId ? { ...c, montantTotal: newAmount } : c,
        ),
      );
    },
    [activeHouseholdId],
  );

  const updateChargeFixeConfigPayeur = useCallback(
    async (chargeId: string, newPayeurId: string) => {
      if (!activeHouseholdId) return;
      await DB.updateChargeFixeConfig(activeHouseholdId, chargeId, {
        payeur: newPayeurId,
      });
      setChargesFixesConfigs((prev) =>
        prev.map((c) =>
          c.id === chargeId ? { ...c, payeur: newPayeurId } : c,
        ),
      );
    },
    [activeHouseholdId],
  );

  const updateChargeFixeConfigCategorie = useCallback(
    async (chargeId: string, categoryId: string) => {
      if (!activeHouseholdId) return;
      await DB.updateChargeFixeConfig(activeHouseholdId, chargeId, {
        categorie: categoryId,
      });
      setChargesFixesConfigs((prev) =>
        prev.map((c) =>
          c.id === chargeId ? { ...c, categorie: categoryId } : c,
        ),
      );
    },
    [activeHouseholdId],
  );

  const updateChargeFixeConfigDay = useCallback(
    async (chargeId: string, newDay: number) => {
      if (!activeHouseholdId) return;
      await DB.updateChargeFixeConfig(activeHouseholdId, chargeId, {
        jourPrelevementMensuel: newDay,
      });
      setChargesFixesConfigs((prev) =>
        prev.map((c) =>
          c.id === chargeId ? { ...c, jourPrelevementMensuel: newDay } : c,
        ),
      );
    },
    [activeHouseholdId],
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
      updateChargeFixeConfig,
      updateChargeFixeConfigPayeur,
      updateChargeFixeConfigDay,
      updateChargeFixeConfigCategorie,
      addChargeFixeConfig,
      deleteChargeFixeConfig,
    }),
    [
      isLoadingComptes,
      chargesFixesConfigs,
      loadConfigs,
      handleAutoAddFixedCharges,
      updateChargeFixeConfig,
      updateChargeFixeConfigPayeur,
      updateChargeFixeConfigDay,
      updateChargeFixeConfigCategorie,
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

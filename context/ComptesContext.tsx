import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  ICompteMensuel,
  IChargeFixe,
  IChargeVariable,
  IReglementData,
  IChargeFixeSnapshot,
} from "../types";
import { useAuth } from "../hooks/useAuth";
import { useCalculs } from "../hooks/useCalculs";
import * as DB from "../services/firebase/db";
import dayjs from "dayjs";
import { IComptesContext } from "./types/ComptesContext.type";
import { useChargesFixesConfigs } from "hooks/useChargesFixesConfigs";

export const ComptesContext = createContext<IComptesContext | undefined>(
  undefined,
);

const getTargetMoisAnnee = () => {
  return dayjs().subtract(1, "month").format("YYYY-MM");
};

const TARGET_MOIS_ANNEE = getTargetMoisAnnee();

export const ComptesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const currentUserUid = user?.id;
  const activeHouseholdId = user?.activeHouseholdId;

  const [currentMonthData, setCurrentMonthData] =
    useState<ICompteMensuel | null>(null);
  const [chargesFixes, setChargesFixes] = useState<IChargeFixe[]>([]);
  const [chargesVariables, setChargesVariables] = useState<IChargeVariable[]>(
    [],
  );
  const [charges, setCharges] = useState<(IChargeVariable | IChargeFixe)[]>([]);
  const [isLoadingComptes, setIsLoadingComptes] = useState(false);
  const [historyMonths, setHistoryMonths] = useState<ICompteMensuel[]>([]);

  const calculs = useCalculs(currentMonthData, charges, currentUserUid);
  const { handleAutoAddFixedCharges } = useChargesFixesConfigs();

  useEffect(() => {
    if (!isLoadingComptes && charges.length > 0) {
      handleAutoAddFixedCharges(charges);
    }
  }, [charges, isLoadingComptes, handleAutoAddFixedCharges]);

  const loadData = useCallback(async () => {
    if (!activeHouseholdId || !currentUserUid) return;

    setIsLoadingComptes(true);
    try {
      let moisData = await DB.getCompteMensuel(
        activeHouseholdId,
        TARGET_MOIS_ANNEE,
      );

      if (!moisData) {
        const nouveauMois: ICompteMensuel = {
          id: TARGET_MOIS_ANNEE,
          moisAnnee: TARGET_MOIS_ANNEE,
          statut: "ouvert",
          loyerTotal: 0,
          apportsAPL: {},
          dettes: [],
          loyerPayeurUid: currentUserUid,
        };

        await DB.createCompteMensuel(activeHouseholdId, nouveauMois);
        moisData = nouveauMois;
      }

      setCurrentMonthData(moisData);
      const chargesFixesData = await DB.getChargesByType<IChargeFixe>(
        activeHouseholdId,
        "fixe",
      );
      setChargesFixes(chargesFixesData);

      const chargesVariablesData = await DB.getChargesByType<IChargeVariable>(
        activeHouseholdId,
        "variable",
      );
      setChargesVariables(chargesVariablesData);

      if (activeHouseholdId === currentUserUid) {
        const allCharges = await DB.getSoloChargesByType<IChargeVariable>(
          user.households,
          currentUserUid,
          "variable",
        );
        setCharges(allCharges);
      } else {
        const charges = await DB.getAllCharges(activeHouseholdId);
        setCharges(charges);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des comptes:", error);
    } finally {
      setIsLoadingComptes(false);
    }
  }, [activeHouseholdId, currentUserUid, user?.households]);

  const loadHistory = useCallback(async () => {
    if (!activeHouseholdId) return;
    try {
      const historyData = await DB.getHistoryMonths(activeHouseholdId);
      setHistoryMonths(historyData);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
  }, [activeHouseholdId]);

  const addChargeFixe = useCallback(
    async (charge: Omit<IChargeFixe, "id" | "householdId">) => {
      if (!activeHouseholdId) return;
      try {
        const id = await DB.addCharge(activeHouseholdId, charge);
        const newCharge: IChargeFixe = {
          id,
          householdId: activeHouseholdId,
          ...charge,
        };
        setChargesFixes((prev) => [...prev, newCharge]);
      } catch (error) {
        console.error("Erreur addChargeFixe:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const deleteChargeFixe = useCallback(
    async (chargeId: string) => {
      if (!activeHouseholdId) return;
      try {
        await DB.deleteCharge(activeHouseholdId, chargeId);
        setChargesFixes((prev) => prev.filter((c) => c.id !== chargeId));
      } catch (error) {
        console.error("Erreur deleteChargeFixe:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const updateChargeFixe = useCallback(
    async (chargeId: string, newAmount: number) => {
      if (!activeHouseholdId) return;
      try {
        await DB.updateCharge(activeHouseholdId, chargeId, {
          montantTotal: newAmount,
        });
        setChargesFixes((prev) =>
          prev.map((c) =>
            c.id === chargeId ? { ...c, montantTotal: newAmount } : c,
          ),
        );
      } catch (error) {
        console.error("Erreur updateChargeFixe:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const updateLoyer = useCallback(
    async (
      loyerTotal: number,
      apportsAPL: Record<string, number>,
      loyerPayeurUid: string,
    ) => {
      if (!currentMonthData || !activeHouseholdId) return;
      try {
        await DB.updateLoyerApl(
          activeHouseholdId,
          currentMonthData.id,
          loyerTotal,
          apportsAPL,
          loyerPayeurUid,
        );
        setCurrentMonthData((prev) =>
          prev ? { ...prev, loyerTotal, apportsAPL, loyerPayeurUid } : prev,
        );
      } catch (error) {
        console.error("Erreur updateLoyer:", error);
        throw error;
      }
    },
    [currentMonthData, activeHouseholdId],
  );

  const addChargeVariable = useCallback(
    async (charge: Omit<IChargeVariable, "id" | "householdId">) => {
      if (!activeHouseholdId) return;
      try {
        const chargeToSave: Omit<IChargeVariable, "id"> = {
          ...charge,
          householdId: activeHouseholdId,
        };
        const id = await DB.addCharge(activeHouseholdId, chargeToSave);
        const newVar: IChargeVariable = {
          id,
          householdId: activeHouseholdId,
          ...charge,
        };
        setCharges((prev) => [...prev, newVar]);
      } catch (error) {
        console.error("Erreur addChargeVariable:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const updateCharge = useCallback(
    async (
      chargeId: string,
      updateData: Partial<IChargeVariable & IChargeFixe>,
    ) => {
      if (!activeHouseholdId) return;
      try {
        await DB.updateCharge(activeHouseholdId, chargeId, updateData);

        setCharges((prev) =>
          prev.map((c) => {
            if (c.id === chargeId) {
              return {
                ...(c as any),
                ...(updateData as any),
              } as IChargeFixe | IChargeVariable;
            }
            return c;
          }),
        );
      } catch (error) {
        console.error("Erreur updateCharge:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const deleteCharge = useCallback(
    async (chargeId: string) => {
      if (!activeHouseholdId) return;
      try {
        await DB.deleteCharge(activeHouseholdId, chargeId);
        setCharges((prev) => prev.filter((c) => c.id !== chargeId));
      } catch (error) {
        console.error("Erreur deleteChargeVariable:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const cloturerMois = useCallback(
    async (
      data: IReglementData & { chargesFixesSnapshot?: IChargeFixeSnapshot[] },
    ) => {
      if (!currentMonthData || !currentMonthData.id || !activeHouseholdId) {
        throw new Error("Impossible de clôturer le mois : données manquantes.");
      }

      console.log("Données reçues pour clôture:", data);

      const snapshot =
        data.chargesFixesSnapshot ||
        chargesFixes.map((charge) => ({
          description: charge.description,
          montantTotal: charge.montantTotal,
          payeur: charge.payeur,
        }));
      setIsLoadingComptes(true);
      try {
        await updateLoyer(
          data.loyerTotal,
          data.apportsAPL,
          data.loyerPayeurUid,
        );
        await DB.updateRegularisationDettes(
          activeHouseholdId,
          currentMonthData.id,
          data.dettes,
          snapshot,
        );

        await DB.addChargeVariableRegularisation(
          activeHouseholdId,
          currentMonthData.id,
          data.dettesRegularisation,
        );

        setCurrentMonthData((prev) =>
          prev
            ? {
                ...prev,
                dettes: data.dettes,
              }
            : prev,
        );

        await DB.setMoisFinalise(activeHouseholdId, currentMonthData.id);
        await loadData();
      } catch (error) {
        console.error("Erreur lors de la clôture du mois:", error);
        throw error;
      } finally {
        setIsLoadingComptes(false);
      }
    },
    [currentMonthData, loadData, updateLoyer, chargesFixes, activeHouseholdId],
  );

  useEffect(() => {
    if (user) loadHistory();
  }, [user, loadData, loadHistory]);

  useEffect(() => {
    if (user) loadData();
    else {
      setCurrentMonthData(null);
      setChargesFixes([]);
      setChargesVariables([]);
      setCharges([]);
    }
  }, [user, loadData]);

  const getMonthDataById = useCallback(
    (moisAnnee: string) => {
      if (currentMonthData?.moisAnnee === moisAnnee) {
        return currentMonthData;
      }
      return historyMonths.find((m) => m.moisAnnee === moisAnnee);
    },
    [historyMonths, currentMonthData],
  );

  const contextValue = useMemo(
    () => ({
      currentMonthData,
      chargesFixes,
      chargesVariables,
      charges,
      isLoadingComptes,
      historyMonths,
      loadData,
      updateLoyer,
      addChargeVariable,
      updateCharge,
      deleteCharge,
      addChargeFixe,
      deleteChargeFixe,
      updateChargeFixe,
      cloturerMois,
      loadHistory,
      getMonthDataById,
      targetMoisAnnee: TARGET_MOIS_ANNEE,
      ...calculs,
    }),
    [
      currentMonthData,
      chargesFixes,
      chargesVariables,
      charges,
      isLoadingComptes,
      historyMonths,
      loadData,
      updateLoyer,
      addChargeVariable,
      updateCharge,
      deleteCharge,
      addChargeFixe,
      deleteChargeFixe,
      updateChargeFixe,
      cloturerMois,
      loadHistory,
      getMonthDataById,
      calculs,
    ],
  );

  return (
    <ComptesContext.Provider value={contextValue}>
      {children}
    </ComptesContext.Provider>
  );
};

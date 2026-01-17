import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  const [isLoadingComptes, setIsLoadingComptes] = useState(false);
  const [historyMonths, setHistoryMonths] = useState<ICompteMensuel[]>([]);

  const calculs = useCalculs(
    currentMonthData,
    chargesFixes,
    chargesVariables,
    currentUserUid,
  );

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

      const chargesFixesData = await DB.getChargesFixes(activeHouseholdId);
      setChargesFixes(chargesFixesData);

      if (activeHouseholdId === currentUserUid) {
        const allCharges = await DB.getSoloChargesVariables(
          user.households,
          currentUserUid,
        );
        setChargesVariables(allCharges);
      } else {
        const charges = await DB.getChargesVariables(activeHouseholdId);
        setChargesVariables(charges);
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

  const updateChargeFixe = useCallback(
    async (chargeId: string, newAmount: number) => {
      if (!activeHouseholdId) return;
      try {
        await DB.updateChargeFixeAmount(activeHouseholdId, chargeId, newAmount);
        setChargesFixes((prev) =>
          prev.map((c) =>
            c.id === chargeId ? { ...c, montantMensuel: newAmount } : c,
          ),
        );
      } catch (error) {
        console.error("Erreur updateChargeFixe:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const updateChargeFixePayeur = useCallback(
    async (chargeId: string, newPayeurId: string) => {
      if (!activeHouseholdId) return;
      try {
        await DB.updateChargeFixePayeur(
          activeHouseholdId,
          chargeId,
          newPayeurId,
        );

        setChargesFixes((prev) =>
          prev.map((c) =>
            c.id === chargeId ? { ...c, payeur: newPayeurId } : c,
          ),
        );
      } catch (error) {
        console.error("Erreur updateChargeFixePayeur:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const addChargeFixe = useCallback(
    async (charge: Omit<IChargeFixe, "id" | "householdId">) => {
      if (!activeHouseholdId) return;
      try {
        const id = await DB.addChargeFixe(activeHouseholdId, charge);
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
        await DB.deleteChargeFixe(activeHouseholdId, chargeId);
        setChargesFixes((prev) => prev.filter((c) => c.id !== chargeId));
      } catch (error) {
        console.error("Erreur deleteChargeFixe:", error);
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
    async (depense: Omit<IChargeVariable, "id" | "householdId">) => {
      if (!activeHouseholdId) return;
      try {
        const chargeToSave: Omit<IChargeVariable, "id"> = {
          ...depense,
          householdId: activeHouseholdId,
        };
        const id = await DB.addChargeVariable(activeHouseholdId, chargeToSave);
        const newVar: IChargeVariable = {
          id,
          householdId: activeHouseholdId,
          ...depense,
        };
        setChargesVariables((prev) => [...prev, newVar]);
      } catch (error) {
        console.error("Erreur addChargeVariable:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const updateChargeVariable = useCallback(
    async (
      chargeId: string,
      updateData: Partial<
        Omit<
          IChargeVariable,
          "id" | "householdId" | "moisAnnee" | "date" | "categorie"
        >
      >,
    ) => {
      if (!activeHouseholdId) return;
      try {
        await DB.updateChargeVariable(activeHouseholdId, chargeId, updateData);
        setChargesVariables((prev) =>
          prev.map((c) => (c.id === chargeId ? { ...c, ...updateData } : c)),
        );
      } catch (error) {
        console.error("Erreur updateChargeVariable:", error);
        throw error;
      }
    },
    [activeHouseholdId],
  );

  const deleteChargeVariable = useCallback(
    async (chargeId: string) => {
      if (!activeHouseholdId) return;
      try {
        await DB.deleteChargeVariable(activeHouseholdId, chargeId);
        setChargesVariables((prev) => prev.filter((c) => c.id !== chargeId));
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

      const snapshot =
        data.chargesFixesSnapshot ||
        chargesFixes.map((charge) => ({
          nom: charge.nom,
          montantMensuel: charge.montantMensuel,
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
          data.dettes,
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
      isLoadingComptes,
      historyMonths,
      loadData,
      updateChargeFixe,
      updateChargeFixePayeur,
      updateLoyer,
      addChargeVariable,
      updateChargeVariable,
      deleteChargeVariable,
      addChargeFixe,
      deleteChargeFixe,
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
      isLoadingComptes,
      historyMonths,
      loadData,
      updateChargeFixe,
      updateChargeFixePayeur,
      updateLoyer,
      addChargeVariable,
      updateChargeVariable,
      deleteChargeVariable,
      addChargeFixe,
      deleteChargeFixe,
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

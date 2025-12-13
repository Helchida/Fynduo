import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ICompteMensuel, IChargeFixe, IChargeVariable, IDette } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCalculs, IResultatsCalcul } from '../hooks/useCalculs';
import * as DB from '../services/firebase/db';
import dayjs from 'dayjs';

export interface IReglementData {
  loyerTotal: number;
  apportsAPL: Record<string, number>;
  dettes: IDette[];
  loyerPayeurUid: string;
}

interface IComptesContext extends IResultatsCalcul {
  currentMonthData: ICompteMensuel | null;
  chargesFixes: IChargeFixe[];
  chargesVariables: IChargeVariable[];
  isLoadingComptes: boolean;
  historyMonths: ICompteMensuel[];
  loadData: () => Promise<void>;
  updateChargeFixe: (chargeId: string, newAmount: number) => Promise<void>;
  updateChargeFixePayeur: (chargeId: string, newPayeurId: string) => Promise<void>;
  updateLoyer: (loyerTotal: number, apportsAPL: Record<string, number>, loyerPayeurUid: string) => Promise<void>;
  addChargeVariable: (depense: Omit<IChargeVariable, 'id' | 'householdId'>) => Promise<void>;
  addChargeFixe: (charge: Omit<IChargeFixe, 'id' | 'householdId'>) => Promise<void>;
  deleteChargeFixe: (chargeId: string) => Promise<void>; 
  cloturerMois: (data: IReglementData) => Promise<void>;
  loadHistory: () => Promise<void>; 
  getMonthDataById: (moisAnnee: string) => ICompteMensuel | undefined; 
}

export const ComptesContext = createContext<IComptesContext | undefined>(undefined);

const getTargetMoisAnnee = () => {
    return dayjs().subtract(1, 'month').format('YYYY-MM');
};

const TARGET_MOIS_ANNEE = getTargetMoisAnnee();

export const ComptesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserUid = user?.id;
  const householdId = user?.householdId;

  const [currentMonthData, setCurrentMonthData] = useState<ICompteMensuel | null>(null);
  const [chargesFixes, setChargesFixes] = useState<IChargeFixe[]>([]);
  const [chargesVariables, setChargesVariables] = useState<IChargeVariable[]>([]);
  const [isLoadingComptes, setIsLoadingComptes] = useState(false);
  const [historyMonths, setHistoryMonths] = useState<ICompteMensuel[]>([]);
  

  const calculs = useCalculs(currentMonthData, chargesFixes, chargesVariables, currentUserUid);

  

  const loadData = useCallback(async () => {
    if (!householdId || !currentUserUid) return;

    setIsLoadingComptes(true);
    try {
        let moisData = await DB.getCompteMensuel(householdId, TARGET_MOIS_ANNEE);

        if (!moisData) {
            console.log("Compte mensuel non trouvé pour ce mois. Création du document initial...");
            const nouveauMois: ICompteMensuel = {
                id: TARGET_MOIS_ANNEE,
                moisAnnee: TARGET_MOIS_ANNEE,
                statut: 'ouvert',
                loyerTotal: 0, 
                apportsAPL: {},
                dettes: [],
                loyerPayeurUid: currentUserUid
            };
            
            await DB.createCompteMensuel(householdId, nouveauMois); 
            moisData = nouveauMois; 
        }
        
        setCurrentMonthData(moisData);

        const chargesFixesData = await DB.getChargesFixes(householdId);
        setChargesFixes(chargesFixesData);

        const chargesVariablesData = await DB.getChargesVariables(householdId);
        setChargesVariables(chargesVariablesData);

    } catch (error) {
        console.error("Erreur lors du chargement des comptes:", error);
    } finally {
        setIsLoadingComptes(false);
    }
}, [householdId]);

const loadHistory = useCallback(async () => {
  if (!householdId) return;
  try {
      const historyData = await DB.getHistoryMonths(householdId); 
      setHistoryMonths(historyData);
  } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
  }
}, [householdId]);

const updateChargeFixe = useCallback(async (chargeId: string, newAmount: number) => {
  if (!householdId) return;  
  try {
      await DB.updateChargeFixeAmount(householdId, chargeId, newAmount);
      setChargesFixes(prev => prev.map(c => c.id === chargeId ? { ...c, montantMensuel: newAmount } : c));
    } catch (error) {
      console.error("Erreur updateChargeFixe:", error);
      throw error;
    }
  }, [householdId]);

  const updateChargeFixePayeur = useCallback(async (
    chargeId: string, 
    newPayeurId: string
  ) => {
      if (!householdId) return;
      try {
          await DB.updateChargeFixePayeur(householdId, chargeId, newPayeurId);
          
          setChargesFixes(prev => prev.map(c => 
              c.id === chargeId 
                  ? { ...c, payeur: newPayeurId} 
                  : c
          ));
      } catch (error) {
          console.error("Erreur updateChargeFixePayeur:", error);
          throw error;
      }
  }, [householdId]);

  const addChargeFixe = useCallback(async (charge: Omit<IChargeFixe, 'id' | 'householdId'>) => {
    if (!householdId) return;
    try {
      const id = await DB.addChargeFixe(householdId, charge);
      const newCharge: IChargeFixe = { id, householdId, ...charge };
      setChargesFixes(prev => [...prev, newCharge]);
    } catch (error) {
      console.error("Erreur addChargeFixe:", error);
      throw error;
    }
  }, [householdId]);

  const deleteChargeFixe = useCallback(async (chargeId: string) => {
    if (!householdId) return;
    try {
      await DB.deleteChargeFixe(householdId, chargeId);
      setChargesFixes(prev => prev.filter(c => c.id !== chargeId));
    } catch (error) {
      console.error("Erreur deleteChargeFixe:", error);
      throw error;
    }
  }, [householdId]);

  const updateLoyer = useCallback(async (loyerTotal: number, apportsAPL: Record<string, number>, loyerPayeurUid: string) => {
    if (!currentMonthData || !householdId) return;
    try {
      await DB.updateLoyerApl(householdId, currentMonthData.id, loyerTotal, apportsAPL, loyerPayeurUid);
      setCurrentMonthData(prev => prev ? { ...prev, loyerTotal, apportsAPL, loyerPayeurUid } : prev);
    } catch (error) {
      console.error("Erreur updateLoyer:", error);
      throw error;
    }
  }, [currentMonthData, householdId]);

  const addChargeVariable = useCallback(async (depense: Omit<IChargeVariable, 'id' | 'householdId'>) => {
    if (!householdId) return;
    try {
      const id = await DB.addChargeVariable(householdId, depense);
      const newVar: IChargeVariable = { id, householdId, ...depense };
      setChargesVariables(prev => [...prev, newVar]);
    } catch (error) {
      console.error("Erreur addChargeVariable:", error);
      throw error;
    }
  }, [householdId]);

  const cloturerMois = useCallback(async (data: IReglementData) => {
    if (!currentMonthData || !currentMonthData.id || !householdId) {
      throw new Error("Impossible de clôturer le mois : données manquantes.");
    }

    const chargesFixesSnapshot = chargesFixes.map(charge => ({
        nom: charge.nom,
        montantMensuel: charge.montantMensuel,
        payeur: charge.payeur,
    }));
    setIsLoadingComptes(true);
    try {
      await updateLoyer(data.loyerTotal, data.apportsAPL, data.loyerPayeurUid);
      await DB.updateRegularisationDettes(
        householdId,
        currentMonthData.id, 
        data.dettes,
        chargesFixesSnapshot,
      );

      await DB.addChargeVariableRegularisation(
          householdId,
          currentMonthData.id,
          data.dettes
      );
    
      setCurrentMonthData(prev => prev ? { 
          ...prev, 
          dettes: data.dettes
      } : prev);
      
      await DB.setMoisFinalise(householdId, currentMonthData.id);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la clôture du mois:", error);
      throw error;
    } finally {
      setIsLoadingComptes(false);
    }
  }, [currentMonthData, loadData, updateLoyer, chargesFixes, householdId]);




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

  const getMonthDataById = useCallback((moisAnnee: string) => {
      if (currentMonthData?.moisAnnee === moisAnnee) {
          return currentMonthData;
      }
      return historyMonths.find(m => m.moisAnnee === moisAnnee);
  }, [historyMonths, currentMonthData]);

  const contextValue = useMemo(() => ({
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
    addChargeFixe,
    deleteChargeFixe,
    cloturerMois,
    loadHistory,
    getMonthDataById,
    targetMoisAnnee: TARGET_MOIS_ANNEE,
    ...calculs,
  }), [
    currentMonthData, chargesFixes, chargesVariables, isLoadingComptes, historyMonths,
    loadData, updateChargeFixe, updateChargeFixePayeur, updateLoyer, addChargeVariable, addChargeFixe, deleteChargeFixe, cloturerMois, loadHistory, getMonthDataById, calculs
  ]);

  return (
    <ComptesContext.Provider value={contextValue}>
      {children}
    </ComptesContext.Provider>
  );
};

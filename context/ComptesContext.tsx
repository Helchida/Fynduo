import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ICompteMensuel, IChargeFixe, IChargeVariable } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCalculs, IResultatsCalcul } from '../hooks/useCalculs';
import * as DB from '../services/firebase/db';
import dayjs from 'dayjs';

export interface IReglementData {
  loyerTotal: number;
  aplMorgan: number;
  aplJuliette: number;
  detteMorganToJuliette: number;
  detteJulietteToMorgan: number;
}

interface IComptesContext extends IResultatsCalcul {
  currentMonthData: ICompteMensuel | null;
  chargesFixes: IChargeFixe[];
  chargesVariables: IChargeVariable[];
  isLoadingComptes: boolean;
  historyMonths: ICompteMensuel[];
  loadData: () => Promise<void>;
  updateChargeFixe: (chargeId: string, newAmount: number) => Promise<void>;
  updateLoyer: (loyerTotal: number, aplMorgan: number, aplJuliette: number) => Promise<void>;
  addChargeVariable: (depense: Omit<IChargeVariable, 'id'>) => Promise<void>;
  addChargeFixe: (charge: Omit<IChargeFixe, 'id'>) => Promise<void>; 
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
  const currentUser = user?.nom || 'Juliette';

  const [currentMonthData, setCurrentMonthData] = useState<ICompteMensuel | null>(null);
  const [chargesFixes, setChargesFixes] = useState<IChargeFixe[]>([]);
  const [chargesVariables, setChargesVariables] = useState<IChargeVariable[]>([]);
  const [isLoadingComptes, setIsLoadingComptes] = useState(false);
  const [historyMonths, setHistoryMonths] = useState<ICompteMensuel[]>([]);
  

  const calculs = useCalculs(currentMonthData, chargesFixes, chargesVariables, currentUser);

  

  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoadingComptes(true);
    try {
        let moisData = await DB.getCompteMensuel(TARGET_MOIS_ANNEE);

        if (!moisData) {
            console.log("Compte mensuel non trouvé pour ce mois. Création du document initial...");
            const nouveauMois: ICompteMensuel = {
                id: TARGET_MOIS_ANNEE,
                moisAnnee: TARGET_MOIS_ANNEE,
                statut: 'ouvert',
                loyerTotal: 0, 
                aplMorgan: 0,
                aplJuliette: 0,
            };
            
            await DB.createCompteMensuel(nouveauMois); 
            moisData = nouveauMois; 
        }
        
        setCurrentMonthData(moisData);

        const chargesFixesData = await DB.getChargesFixes();
        setChargesFixes(chargesFixesData);

        const chargesVariablesData = await DB.getChargesVariables(TARGET_MOIS_ANNEE);
        setChargesVariables(chargesVariablesData);

    } catch (error) {
        console.error("Erreur lors du chargement des comptes:", error);
    } finally {
        setIsLoadingComptes(false);
    }
}, [user]);

const loadHistory = useCallback(async () => {
  if (!user) return;
  try {
      const historyData = await DB.getHistoryMonths(); 
      setHistoryMonths(historyData);
  } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
  }
}, [user]);


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


  const updateChargeFixe = useCallback(async (chargeId: string, newAmount: number) => {
    try {
      await DB.updateChargeFixeAmount(chargeId, newAmount);
      setChargesFixes(prev => prev.map(c => c.id === chargeId ? { ...c, montantMensuel: newAmount } : c));
    } catch (error) {
      console.error("Erreur updateChargeFixe:", error);
      throw error;
    }
  }, []);


  const addChargeFixe = useCallback(async (charge: Omit<IChargeFixe, 'id'>) => {
  try {
    const id = await DB.addChargeFixe(charge);
    const newCharge: IChargeFixe = { id, ...charge };
    setChargesFixes(prev => [...prev, newCharge]);
  } catch (error) {
    console.error("Erreur addChargeFixe:", error);
    throw error;
  }
}, []);


  const deleteChargeFixe = useCallback(async (chargeId: string) => {
    try {
      await DB.deleteChargeFixe(chargeId);
      setChargesFixes(prev => prev.filter(c => c.id !== chargeId));
    } catch (error) {
      console.error("Erreur deleteChargeFixe:", error);
      throw error;
    }
  }, []);


  const updateLoyer = useCallback(async (loyerTotal: number, aplMorgan: number, aplJuliette: number) => {
    if (!currentMonthData) return;
    try {
      await DB.updateLoyerApl(currentMonthData.id, loyerTotal, aplMorgan, aplJuliette);
      setCurrentMonthData(prev => prev ? { ...prev, loyerTotal, aplMorgan, aplJuliette } : prev);
    } catch (error) {
      console.error("Erreur updateLoyer:", error);
      throw error;
    }
  }, [currentMonthData]);


  const addChargeVariable = useCallback(async (depense: Omit<IChargeVariable, 'id'>) => {
  try {
    const id = await DB.addChargeVariable(depense);
    const newVar: IChargeVariable = { id, ...depense };
    setChargesVariables(prev => [...prev, newVar]);
  } catch (error) {
    console.error("Erreur addChargeVariable:", error);
    throw error;
  }
}, []);


  const cloturerMois = useCallback(async (data: IReglementData) => {
    if (!currentMonthData || !currentMonthData.id) {
      throw new Error("Impossible de clôturer le mois : données manquantes.");
    }

    const detteNetteFinale = calculs.soldeFinal

    const chargesFixesSnapshot = chargesFixes.map(charge => ({
        nom: charge.nom,
        montantMensuel: charge.montantMensuel,
        payeur: charge.payeur,
    }));
    setIsLoadingComptes(true);
    try {
      await updateLoyer(data.loyerTotal, data.aplMorgan, data.aplJuliette);
      await DB.updateRegularisationDettes(
          currentMonthData.id, 
          data.detteMorganToJuliette, 
          data.detteJulietteToMorgan,
          chargesFixesSnapshot,
          detteNetteFinale
      );
    
      setCurrentMonthData(prev => prev ? { 
          ...prev, 
          detteMorganToJuliette: data.detteMorganToJuliette,
          detteJulietteToMorgan: data.detteJulietteToMorgan,
      } : prev);
      
      await DB.setMoisFinalise(currentMonthData.id);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la clôture du mois:", error);
      throw error;
    } finally {
      setIsLoadingComptes(false);
    }
  }, [currentMonthData, loadData, updateLoyer, chargesFixes]);


  const contextValue = useMemo(() => ({
    currentMonthData,
    chargesFixes,
    chargesVariables,
    isLoadingComptes,
    historyMonths,
    loadData,
    updateChargeFixe,
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
    loadData, updateChargeFixe, updateLoyer, addChargeVariable, addChargeFixe, deleteChargeFixe, cloturerMois, loadHistory, getMonthDataById, calculs
  ]);

  return (
    <ComptesContext.Provider value={contextValue}>
      {children}
    </ComptesContext.Provider>
  );
};

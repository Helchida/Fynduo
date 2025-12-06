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

  loadData: () => Promise<void>;
  updateChargeFixe: (chargeId: string, newAmount: number) => Promise<void>;
  updateLoyer: (loyerTotal: number, aplMorgan: number, aplJuliette: number) => Promise<void>;
  addChargeVariable: (depense: Omit<IChargeVariable, 'id'>) => Promise<void>;
  addChargeFixe: (charge: Omit<IChargeFixe, 'id'>) => Promise<void>; 
  deleteChargeFixe: (chargeId: string) => Promise<void>; 
  cloturerMois: (data: IReglementData) => Promise<void>; 
}

export const ComptesContext = createContext<IComptesContext | undefined>(undefined);

const CURRENT_MOIS_ANNEE = dayjs().format('YYYY-MM');

export const ComptesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUser = user?.nom || 'Juliette';

  const [currentMonthData, setCurrentMonthData] = useState<ICompteMensuel | null>(null);
  const [chargesFixes, setChargesFixes] = useState<IChargeFixe[]>([]);
  const [chargesVariables, setChargesVariables] = useState<IChargeVariable[]>([]);
  const [isLoadingComptes, setIsLoadingComptes] = useState(false);

  const calculs = useCalculs(currentMonthData, chargesFixes, chargesVariables, currentUser);


  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoadingComptes(true);
    try {
        let moisData = await DB.getCompteMensuel(CURRENT_MOIS_ANNEE);

        if (!moisData) {
            console.log("Compte mensuel non trouvé pour ce mois. Création du document initial...");
            const nouveauMois: ICompteMensuel = {
                id: CURRENT_MOIS_ANNEE,
                moisAnnee: CURRENT_MOIS_ANNEE,
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

        const chargesVariablesData = await DB.getChargesVariables(CURRENT_MOIS_ANNEE);
        setChargesVariables(chargesVariablesData);

    } catch (error) {
        console.error("Erreur lors du chargement des comptes:", error);
    } finally {
        setIsLoadingComptes(false);
    }
}, [user]);

  useEffect(() => {
    if (user) loadData();
    else {
      setCurrentMonthData(null);
      setChargesFixes([]);
      setChargesVariables([]);
    }
  }, [user, loadData]);


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

    setIsLoadingComptes(true);
    try {
      await updateLoyer(data.loyerTotal, data.aplMorgan, data.aplJuliette);
      await DB.updateRegularisationDettes(
          currentMonthData.id, 
          data.detteMorganToJuliette, 
          data.detteJulietteToMorgan
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
  }, [currentMonthData, loadData, updateLoyer]);


  const contextValue = useMemo(() => ({
    currentMonthData,
    chargesFixes,
    chargesVariables,
    isLoadingComptes,
    loadData,
    updateChargeFixe,
    updateLoyer,
    addChargeVariable,
    addChargeFixe,
    deleteChargeFixe,
    cloturerMois,
    currentMoisAnnee: CURRENT_MOIS_ANNEE,
    ...calculs,
  }), [
    currentMonthData, chargesFixes, chargesVariables, isLoadingComptes,
    loadData, updateChargeFixe, updateLoyer, addChargeVariable, addChargeFixe, deleteChargeFixe, cloturerMois, calculs
  ]);

  return (
    <ComptesContext.Provider value={contextValue}>
      {children}
    </ComptesContext.Provider>
  );
};

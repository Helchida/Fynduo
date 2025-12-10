import { useMemo } from 'react';
import { ICompteMensuel, IChargeFixe, IChargeVariable, Colocataire } from '../types';

export interface IResultatsCalcul {
  detteLoyer: number; 
  detteChargesFixes: number; 
  detteChargesVariables: number; 
  totalChargesFixes: number;
  soldeFinal: number; 
  debiteur: Colocataire | null;
}

const initialResults: IResultatsCalcul = {
    detteLoyer: 0,
    detteChargesFixes: 0,
    detteChargesVariables: 0,
    totalChargesFixes: 0,
    soldeFinal: 0,
    debiteur: null,
};

export const useCalculs = (
  currentMonthData: ICompteMensuel | null, 
  chargesFixes: IChargeFixe[], 
  chargesVariables: IChargeVariable[], 
  currentUser: Colocataire
): IResultatsCalcul => {

    const autreColocataire: Colocataire = currentUser === 'Morgan' ? 'Juliette' : 'Morgan';

  return useMemo(() => {
    let detteLoyer = 0;
    let detteChargesFixes = 0;
    let detteChargesVariables = 0;
    let totalChargesFixes = 0;
    let debiteur: Colocataire | null = null;

    if (!currentMonthData) {
      return initialResults;
    }

    // --- 1. CALCUL DU LOYER NET INDIVIDUEL (Loyer - APL) ---
   
    const partLoyerParPersonne = currentMonthData.loyerTotal / 2;
    const netDuMorgan = partLoyerParPersonne - currentMonthData.aplMorgan;
    const netDeJuliette = partLoyerParPersonne - currentMonthData.aplJuliette; 

    if (currentUser === 'Morgan') {
        detteLoyer = -netDeJuliette;   
    } else { 
        detteLoyer = netDeJuliette;
    }

    // --- 2. CALCUL DES CHARGES FIXES ---
    
    chargesFixes.forEach(charge => {
      const partParPersonne = charge.montantMensuel / 2;
      totalChargesFixes += charge.montantMensuel;

      if (charge.payeur === currentUser) {
        detteChargesFixes -= partParPersonne;
      } else {
        detteChargesFixes += partParPersonne;
      }
    });


    // --- 3. CALCUL DES CHARGES VARIABLES (Ajustement des dettes stockées) ---
    
    let ajustementDettesFinales = 0;
   
    const detteJuliette = currentMonthData.detteJulietteToMorgan ?? 0;
    const detteMorgan = currentMonthData.detteMorganToJuliette ?? 0;


    if (currentUser === 'Juliette') {
      ajustementDettesFinales += detteJuliette;
      ajustementDettesFinales -= detteMorgan;
    } else {
      ajustementDettesFinales -= detteJuliette; 
      ajustementDettesFinales += detteMorgan;
    }

    detteChargesVariables = ajustementDettesFinales;
    
    // --- 4. SOLDE FINAL & DÉBITEUR ---

    const soldeFinal = detteLoyer + detteChargesFixes + detteChargesVariables;

        // Déterminer le débiteur final
        if (soldeFinal > 0) {
            // soldeFinal > 0 signifie que currentUser DOIT
            debiteur = currentUser;
        } else if (soldeFinal < 0) {
            // soldeFinal < 0 signifie que l'autre DOIT à currentUser
            debiteur = autreColocataire;
        } else {
            debiteur = null;
        }

    return {
      detteLoyer,
      detteChargesFixes,
      detteChargesVariables,
      totalChargesFixes,
      soldeFinal,
            debiteur: debiteur,
    };
  }, [currentMonthData, chargesFixes, chargesVariables, currentUser]);
};
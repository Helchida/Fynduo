import { useMemo } from 'react';
import { ICompteMensuel, IChargeFixe, IChargeVariable, IResultatsCalcul } from '../types';



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
  currentUserUid: string | undefined
): IResultatsCalcul => {


  return useMemo(() => {
    let detteLoyer = 0;
    let detteChargesFixes = 0;
    let detteChargesVariables = 0;
    let totalChargesFixes = 0;
    let debiteur: string | null = null;

    if (!currentMonthData || !currentUserUid || !currentMonthData.loyerPayeurUid) {
      return initialResults;
    }

    const loyerPayeurUid = currentMonthData.loyerPayeurUid;

    const uids = Object.keys(currentMonthData.apportsAPL);
    const autreUserUid = uids.find(uid => uid !== currentUserUid) || null;

    if (!autreUserUid || uids.length !== 2) {
        return initialResults; 
    }

    // --- 1. CALCUL DU LOYER NET INDIVIDUEL (Loyer - APL) ---
   
    const partLoyerParPersonne = currentMonthData.loyerTotal / 2;
    const aplCurrentUser = currentMonthData.apportsAPL[currentUserUid] ?? 0;
    const aplAutreUser = currentMonthData.apportsAPL[autreUserUid] ?? 0;

    const netDuCurrentUser = partLoyerParPersonne - aplCurrentUser;
    const netDuAutreUser = partLoyerParPersonne - aplAutreUser;

    if (currentUserUid === loyerPayeurUid) {
      detteLoyer = -netDuAutreUser;
    } else {
      detteLoyer = netDuCurrentUser;
    }

    // --- 2. CALCUL DES CHARGES FIXES ---
    
    chargesFixes.forEach(charge => {
      const partParPersonne = charge.montantMensuel / 2;
      totalChargesFixes += charge.montantMensuel;

      if (charge.payeur === currentUserUid) {
        detteChargesFixes -= partParPersonne;
      } else {
        detteChargesFixes += partParPersonne;
      }
    });


    // --- 3. CALCUL DES CHARGES VARIABLES (Ajustement des dettes stockées) ---
    
    let ajustementDettesFinales = 0;
   
    const detteDuCurrentUser = currentMonthData.dettes.find(d => 
        d.debiteurUid === currentUserUid && d.creancierUid === autreUserUid
    )?.montant ?? 0;

    const detteDeAutreUser = currentMonthData.dettes.find(d => 
        d.debiteurUid === autreUserUid && d.creancierUid === currentUserUid
    )?.montant ?? 0;

    ajustementDettesFinales = detteDuCurrentUser - detteDeAutreUser;
    detteChargesVariables = ajustementDettesFinales;
    
    // --- 4. SOLDE FINAL & DÉBITEUR ---

    const soldeFinal = detteLoyer + detteChargesFixes + detteChargesVariables;

        // Déterminer le débiteur final
        if (soldeFinal > 0) {
            // soldeFinal > 0 signifie que currentUser DOIT
            debiteur = currentUserUid;
        } else if (soldeFinal < 0) {
            // soldeFinal < 0 signifie que l'autre DOIT à currentUser
            debiteur = autreUserUid;
        } else {
            debiteur = null;
        }

    return {
      detteLoyer,
      detteChargesFixes,
      detteChargesVariables,
      totalChargesFixes,
      soldeFinal: soldeFinal,
      debiteur: debiteur,
    };
  }, [currentMonthData, chargesFixes, chargesVariables, currentUserUid]);
};
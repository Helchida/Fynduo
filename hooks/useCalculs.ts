import { useMemo } from 'react';
import { ICompteMensuel, IChargeFixe, IChargeVariable, Colocataire } from '../types';

export interface IResultatsCalcul {
    detteLoyer: number;
    detteChargesFixes: number;
    detteChargesVariables: number;
    totalChargesFixes: number;
    soldeFinal: number;
}

const initialResults: IResultatsCalcul = {
    detteLoyer: 0,
    detteChargesFixes: 0,
    detteChargesVariables: 0,
    totalChargesFixes: 0,
    soldeFinal: 0,
};

export const useCalculs = (
    currentMonthData: ICompteMensuel | null, 
    chargesFixes: IChargeFixe[], 
    chargesVariables: IChargeVariable[], 
    currentUser: Colocataire
): IResultatsCalcul => {

    return useMemo(() => {
        let detteLoyer = 0;
        let detteChargesFixes = 0;
        let detteChargesVariables = 0;
        let totalChargesFixes = 0;

        if (!currentMonthData) {
            return initialResults;
        }


        // 1. CALCUL DU LOYER NET INDIVIDUEL (Loyer - APL)
       
        const partLoyerParPersonne = currentMonthData.loyerTotal / 2;
        const detteJulietteToMorgan = partLoyerParPersonne - currentMonthData.aplJuliette;
        const detteMorganToJuliette = partLoyerParPersonne - currentMonthData.aplMorgan; 


        if (currentUser === 'Morgan') {
            detteLoyer = detteJulietteToMorgan;
        } else {
            detteLoyer = -detteJulietteToMorgan;
        }

        // 2. CALCUL DES CHARGES FIXES 
        
        chargesFixes.forEach(charge => {
            const partParPersonne = charge.montantMensuel / 2;
            totalChargesFixes += charge.montantMensuel;
            if (charge.payeur === currentUser) {
                detteChargesFixes += partParPersonne;
            } else {
                detteChargesFixes -= partParPersonne;
            }
        });


        // 3. CALCUL DES CHARGES VARIABLES (comme Tricount) - Ajout plus tard
        
    /*    chargesVariables.forEach(depense => {
            // Gestion des charges variables partagées (Courses, etc.)
            if (depense.beneficiaires.includes(currentUser)) {
                
                const partDue = depense.montantTotal / depense.beneficiaires.length;

                if (depense.payeur === currentUser) {
                    detteChargesVariables += (depense.montantTotal - partDue);
                } else {
                    detteChargesVariables -= partDue; 
                }
            }
        });

    */
        // 4. SOLDE FINAL

        let ajustementDettesFinales = 0;
      
        const detteJuliette = currentMonthData.detteJulietteToMorgan ?? 0;
        const detteMorgan = currentMonthData.detteMorganToJuliette ?? 0;

        // Juliette doit à Morgan (Morgan reçoit, Juliette donne)
        if (detteJuliette > 0) {
            ajustementDettesFinales += (currentUser === 'Morgan' ? detteJuliette : -detteJuliette);
        }
        
        // Morgan doit à Juliette (Morgan donne, Juliette reçoit)
        if (detteMorgan > 0) {
            ajustementDettesFinales += (currentUser === 'Morgan' ? -detteMorgan : detteMorgan);
        }

        detteChargesVariables += ajustementDettesFinales;
        
        const soldeFinal = detteLoyer + detteChargesFixes + detteChargesVariables;

        return {
            detteLoyer: detteLoyer,
            detteChargesFixes: detteChargesFixes,
            detteChargesVariables: detteChargesVariables,
            totalChargesFixes: totalChargesFixes,
            soldeFinal: soldeFinal,
        };
    }, [currentMonthData, chargesFixes, chargesVariables, currentUser]);
}; 

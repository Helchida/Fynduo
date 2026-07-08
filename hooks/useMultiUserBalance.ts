import { ICharge, IUser } from "@/types";
import { useMemo } from "react";

export const useMultiUserBalance = (
  charges: ICharge[],
  householdUsers: IUser[],
) => {
  return useMemo(() => {
    const balances: Record<string, number> = {};
    householdUsers.forEach((u) => (balances[u.id] = 0));

    charges.forEach((charge) => {
      const montant = charge.montantTotal;

      if (balances[charge.payeur] !== undefined) {
        balances[charge.payeur] += montant;
      }

      let repartitionMap: Record<string, number> = {};

      if (charge.repartition) {
        repartitionMap = typeof charge.repartition === "string" 
          ? JSON.parse(charge.repartition) 
          : charge.repartition;
      } else {
        const nbBeneficiaires = charge.beneficiaires?.length || 0;
        if (nbBeneficiaires === 0) {
          if (balances[charge.payeur] !== undefined) balances[charge.payeur] -= montant;
          return;
        }
        
        const partIndividuelle = montant / nbBeneficiaires;
        charge.beneficiaires.forEach((uid) => {
          repartitionMap[uid] = partIndividuelle;
        });
      }

      Object.entries(repartitionMap).forEach(([uid, part]) => {
        if (balances[uid] !== undefined) {
          balances[uid] -= part;
        }
      });
    });

    return balances;
  }, [charges, householdUsers]);
};
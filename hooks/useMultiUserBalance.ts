import { IChargeFixe, IChargeVariable, IUser } from "@/types";
import { useMemo } from "react";

export const useMultiUserBalance = (
  charges: (IChargeVariable | IChargeFixe)[],
  householdUsers: IUser[],
) => {
  return useMemo(() => {
    const balances: Record<string, number> = {};
    householdUsers.forEach((u) => (balances[u.id] = 0));

    charges.forEach((charge) => {
      const montant = charge.montantTotal;
      const nbBeneficiaires = charge.beneficiaires.length;
      if (nbBeneficiaires === 0) return;

      const partIndividuelle = montant / nbBeneficiaires;

      if (balances[charge.payeur] !== undefined) {
        balances[charge.payeur] += montant;
      }

      charge.beneficiaires.forEach((uid) => {
        if (balances[uid] !== undefined) {
          balances[uid] -= partIndividuelle;
        }
      });
    });

    return balances;
  }, [charges, householdUsers]);
};

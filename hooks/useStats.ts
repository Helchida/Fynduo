import { useMemo } from "react";
import {
  ICategorie,
  StatPeriod,
  StatDataItem,
  ICharge,
} from "@/types";
import dayjs from "dayjs";

export const useStats = (
  charges: ICharge[],
  categories: ICategorie[],
  period: StatPeriod,
  referenceDate: string,
  currentUserUid: string | undefined,
  isSoloMode: boolean,
) => {
  const statsParCategorie = useMemo((): StatDataItem[] => {
    const filtered = charges.filter((c) => {
      if (c.type === "fixe") return false;
      if (period === "tout") return true;

      const chargeMoisAnnee =
        c.moisAnnee || dayjs(c.dateStatistiques).format("YYYY-MM");

      if (period === "mois") return chargeMoisAnnee === referenceDate;
      if (period === "annee") {
        return chargeMoisAnnee.startsWith(referenceDate);
      }
      return true;
    });

    const aggregation = filtered.reduce(
      (acc, charge) => {
        const catId = charge.categorie || "cat_autre";
        const montantTotal = Number(charge.montantTotal) || 0;

        let montantFinal = montantTotal;

        if (
          isSoloMode &&
          charge.beneficiaires &&
          charge.beneficiaires.length > 0
        ) {
          const estBeneficiaire = charge.beneficiaires.includes(
            currentUserUid || "",
          );

          if (estBeneficiaire) {
            montantFinal = montantTotal / charge.beneficiaires.length;
          } else {
            montantFinal = 0;
          }
        }

        acc[catId] = (acc[catId] || 0) + montantFinal;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(aggregation)
      .map(([catId, montant]) => {
        const catInfo = categories.find((c) => c.id === catId);
        return {
          categoryId: catId,
          montant: montant,
          label: catInfo?.label || "Autre",
          icon: catInfo?.icon || "📦",
        };
      })
      .filter(
        (item) => item.montant > 0 && item.categoryId !== "cat_remboursement",
      )
      .sort((a, b) => b.montant - a.montant);
  }, [charges, categories, period, referenceDate, currentUserUid, isSoloMode]);

  const total = useMemo(
    () => statsParCategorie.reduce((sum, i) => sum + i.montant, 0),
    [statsParCategorie],
  );

  return { statsParCategorie, total };
};

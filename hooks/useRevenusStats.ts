import { useMemo } from "react";
import {
  StatPeriod,
  IRevenu,
  ICategorieRevenu,
  StatCategorie,
} from "@/types";
import dayjs from "dayjs";

export const useRevenusStats = (
  revenus: IRevenu[],
  categoriesRevenus: ICategorieRevenu[],
  period: StatPeriod,
  referenceDate: string,
  currentUserUid: string | undefined,
) => {
  const statsRevenusParCategorie = useMemo((): StatCategorie[] => {
    const filtered = revenus.filter((r) => {
      if (period === "tout") return true;

      const revenuMoisAnnee =
        dayjs(r.dateReception).format("YYYY-MM");

      if (period === "mois") return revenuMoisAnnee === referenceDate;
      if (period === "annee") {
        return revenuMoisAnnee.startsWith(referenceDate);
      }
      return true;
    });

    const aggregation = filtered.reduce(
      (acc, revenu) => {
        const catId = revenu.categorie || "cat_autre";
        const montantTotal = Number(revenu.montant) || 0;

        let montantFinal = montantTotal;


        acc[catId] = (acc[catId] || 0) + montantFinal;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(aggregation)
      .map(([catId, montant]) => {
        const catInfo = categoriesRevenus.find((c) => c.id === catId);
        return {
          categoryId: catId,
          montant: montant,
          label: catInfo?.label || "Autre",
          icon: catInfo?.icon || "💵",
        };
      })
      .filter(
        (item) => item.montant > 0,
      )
      .sort((a, b) => b.montant - a.montant);
  }, [revenus, categoriesRevenus, period, referenceDate, currentUserUid]);

  const totalRevenus = useMemo(
    () => statsRevenusParCategorie.reduce((sum, i) => sum + i.montant, 0),
    [statsRevenusParCategorie],
  );

  return { statsRevenusParCategorie, totalRevenus };
};

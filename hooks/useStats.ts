import { useMemo } from "react";
import { ICategorie, StatPeriod, ICharge, StatCategorie } from "@/types";
import dayjs from "dayjs";
import {
  FinancialPeriod,
  isDateInFinancialPeriod,
} from "utils/financialPeriods";

const getChargeFinalAmountForUser = (
  charge: ICharge,
  currentUserUid: string | undefined,
  isSoloMode: boolean,
): number => {
  const montantTotal = Number(charge.montantTotal) || 0;

  if (!isSoloMode) {
    return montantTotal;
  }

  if (charge.beneficiaires && charge.beneficiaires.length > 0) {
    const estBeneficiaire = charge.beneficiaires.includes(currentUserUid || "");
    if (!estBeneficiaire) {
      return 0;
    }

    let repartitionMap: Record<string, number> | null = null;
    if (charge.repartition) {
      try {
        repartitionMap =
          typeof charge.repartition === "string"
            ? JSON.parse(charge.repartition)
            : charge.repartition;
      } catch (e) {
        repartitionMap = null;
      }
    }

    if (
      repartitionMap &&
      currentUserUid &&
      repartitionMap[currentUserUid] !== undefined
    ) {
      return repartitionMap[currentUserUid];
    }

    return montantTotal / charge.beneficiaires.length;
  }

  return montantTotal;
};

export const useStats = (
  charges: ICharge[],
  categories: ICategorie[],
  period: StatPeriod,
  referenceDate: string,
  currentUserUid: string | undefined,
  isSoloMode: boolean,
  financialPeriod: FinancialPeriod | null = null,
) => {
  const variablesStatsParCategorie = useMemo((): StatCategorie[] => {
    const filtered = charges.filter((c) => {
      if (c.nature === "remboursement") return false;
      if (c.type === "fixe") return false;
      if (period === "tout") return true;

      const chargeMoisAnnee = dayjs(c.dateStatistiques).format("YYYY-MM");

      if (period === "mois")
        return financialPeriod
          ? isDateInFinancialPeriod(c.dateStatistiques, financialPeriod)
          : chargeMoisAnnee === referenceDate;
      if (period === "annee") {
        return chargeMoisAnnee.startsWith(referenceDate);
      }
      return true;
    });

    const aggregation = filtered.reduce(
      (acc, charge) => {
        const catId = charge.categorie || "cat_autre";
        const montantFinal = getChargeFinalAmountForUser(
          charge,
          currentUserUid,
          isSoloMode,
        );

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
      .filter((item) => item.montant > 0)
      .sort((a, b) => b.montant - a.montant);
  }, [
    charges,
    categories,
    period,
    referenceDate,
    currentUserUid,
    isSoloMode,
    financialPeriod,
  ]);

  const fixesStatsParCategorie = useMemo((): StatCategorie[] => {
    const filtered = charges.filter((c) => {
      if (c.nature === "remboursement") return false;
      if (c.type === "variable") return false;
      if (period === "tout") return true;

      const chargeMoisAnnee = dayjs(c.dateStatistiques).format("YYYY-MM");

      if (period === "mois")
        return financialPeriod
          ? isDateInFinancialPeriod(c.dateStatistiques, financialPeriod)
          : chargeMoisAnnee === referenceDate;
      if (period === "annee") {
        return chargeMoisAnnee.startsWith(referenceDate);
      }
      return true;
    });

    const aggregation = filtered.reduce(
      (acc, charge) => {
        const catId = charge.categorie || "cat_autre";
        const montantFinal = getChargeFinalAmountForUser(
          charge,
          currentUserUid,
          isSoloMode,
        );

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
      .filter((item) => item.montant > 0)
      .sort((a, b) => b.montant - a.montant);
  }, [
    charges,
    categories,
    period,
    referenceDate,
    currentUserUid,
    isSoloMode,
    financialPeriod,
  ]);

  const allChargesStatsParCategorie = useMemo((): StatCategorie[] => {
    const filtered = charges.filter((c) => {
      if (c.nature === "remboursement") return false;
      if (period === "tout") return true;

      const chargeMoisAnnee = dayjs(c.dateStatistiques).format("YYYY-MM");

      if (period === "mois")
        return financialPeriod
          ? isDateInFinancialPeriod(c.dateStatistiques, financialPeriod)
          : chargeMoisAnnee === referenceDate;
      if (period === "annee") {
        return chargeMoisAnnee.startsWith(referenceDate);
      }
      return true;
    });

    const aggregation = filtered.reduce(
      (acc, charge) => {
        const catId = charge.categorie || "cat_autre";
        const montantFinal = getChargeFinalAmountForUser(
          charge,
          currentUserUid,
          isSoloMode,
        );

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
      .filter((item) => item.montant > 0)
      .sort((a, b) => b.montant - a.montant);
  }, [
    charges,
    categories,
    period,
    referenceDate,
    currentUserUid,
    isSoloMode,
    financialPeriod,
  ]);

  const totalVariable = useMemo(
    () => variablesStatsParCategorie.reduce((sum, i) => sum + i.montant, 0),
    [variablesStatsParCategorie],
  );

  const totalFixe = useMemo(
    () => fixesStatsParCategorie.reduce((sum, i) => sum + i.montant, 0),
    [fixesStatsParCategorie],
  );

  const totalAllCharges = useMemo(
    () => allChargesStatsParCategorie.reduce((sum, i) => sum + i.montant, 0),
    [allChargesStatsParCategorie],
  );

  return {
    variablesStatsParCategorie,
    totalVariable,
    fixesStatsParCategorie,
    totalFixe,
    allChargesStatsParCategorie,
    totalAllCharges,
  };
};

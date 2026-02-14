import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  RootStackNavigationProp,
  IDette,
  IReglementData,
  ChargeFixeForm,
  ILoyerConfig,
} from "../../types";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { useHouseholdUsers } from "../../hooks/useHouseholdUsers";
import { nanoid } from "nanoid/non-secure";
import { styles } from "./RegulationScreen.style";
import dayjs from "dayjs";
import LoyerSection from "./LoyerSection/LoyerSection";
import ChargesFixesSection from "./ChargesFixesSection/ChargesFixesSection";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useToast } from "hooks/useToast";
import ChargesSection from "./ChargesSection/ChargesSection";
import { useMultiUserBalance } from "hooks/useMultiUserBalance";
import { calculSimplifiedTransfers } from "utils/calculSimplifiedTransfers";
import * as DB from "../../services/supabase/db";

const RegulationScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const activeHouseholdId = user.activeHouseholdId;
  const { householdUsers, getDisplayName } = useHouseholdUsers();

  const {
    currentMonthData,
    chargesFixes,
    chargesVariables,
    charges,
    cloturerMois,
    updateChargeFixe,
    addChargeFixe,
    deleteChargeFixe,
    isLoadingComptes,
  } = useComptes();

  const [loyerConfig, setLoyerConfig] = useState<ILoyerConfig | null>(null);
  const [isLoadingLoyerConfig, setIsLoadingLoyerConfig] = useState(true);
  const [loyerTotal, setLoyerTotal] = useState("");
  const [apportsAPLForm, setApportsAPLForm] = useState<Record<string, string>>(
    {},
  );
  const [chargesFormMap, setChargesFormMap] = useState<
    Record<string, ChargeFixeForm[]>
  >({});

  const moisEnCoursDeCloture = currentMonthData?.moisAnnee;

  const chargesPourBalanceAffichee = useMemo(() => {
    return charges.filter((c) => {
      if (c.type === "variable") return true;
      return c.type === "fixe" && c.moisAnnee === moisEnCoursDeCloture;
    });
  }, [charges, moisEnCoursDeCloture]);

  const balancesAffichees = useMultiUserBalance(
    chargesPourBalanceAffichee,
    householdUsers,
  );
  const virementsAffiches = useMemo(() => {
    return calculSimplifiedTransfers(balancesAffichees);
  }, [balancesAffichees]);

  const balancesRegularisation = useMultiUserBalance(charges, householdUsers);
  const virementsRegularisation = useMemo(() => {
    return calculSimplifiedTransfers(balancesRegularisation);
  }, [balancesRegularisation]);

  const moisDeLoyerAffiche = currentMonthData?.moisAnnee
    ? dayjs(currentMonthData.moisAnnee).add(1, "month").format("YYYY-MM")
    : dayjs().add(1, "month").format("YYYY-MM");

  const user1 = householdUsers[0];
  const user2 = householdUsers[1];

  const uid1 = user1?.id || "UID1_INCONNU";
  const uid2 = user2?.id || "UID2_INCONNU";

  useEffect(() => {
    if (currentMonthData && currentMonthData.statut === "finalisé") {
      navigation.replace("SummaryRegulation");
    }
  }, [currentMonthData, navigation]);

  useEffect(() => {
    const loadLoyerConfig = async () => {
      if (activeHouseholdId) {
        try {
          let config = await DB.getLoyerConfig(activeHouseholdId);

          if (!config && householdUsers.length > 0) {
            await DB.initLoyerConfig(
              activeHouseholdId,
              householdUsers.map((u) => u.id),
            );
            config = await DB.getLoyerConfig(activeHouseholdId);
          }

          setLoyerConfig(config);
        } catch (error) {
          console.error("Erreur chargement config loyer:", error);
          toast.error(
            "Erreur",
            "Impossible de charger la configuration du loyer.",
          );
        } finally {
          setIsLoadingLoyerConfig(false);
        }
      }
    };

    if (householdUsers.length > 0) {
      loadLoyerConfig();
    }
  }, [activeHouseholdId, householdUsers]);

  useEffect(() => {
    if (householdUsers.length > 0 && charges.length > 0) {
      const newMap: Record<string, ChargeFixeForm[]> = {};

      householdUsers.forEach((u) => {
        const chargesFixesDuMois = chargesFixes
          .filter(
            (c) =>
              c.payeur === u.id && c.moisAnnee === currentMonthData?.moisAnnee,
          )
          .map(
            (c) =>
              ({
                ...c,
                montantForm: c.montantTotal.toString(),
                isNew: false,
                jourPrelevementMensuel: 1,
              }) as ChargeFixeForm,
          );

        newMap[u.id] = chargesFixesDuMois;
      });

      setChargesFormMap(newMap);
    }
  }, [householdUsers, charges, currentMonthData?.moisAnnee, chargesFixes]);

  useEffect(() => {
    if (loyerConfig) {
      if (loyerTotal === "0" || loyerTotal === "") {
        setLoyerTotal(loyerConfig.loyerTotal.toString());
      }

      if (Object.keys(apportsAPLForm).length === 0 && loyerConfig.apportsAPL) {
        const formattedAPL: Record<string, string> = {};

        Object.entries(loyerConfig.apportsAPL).forEach(([uid, montant]) => {
          formattedAPL[uid] = montant.toString();
        });

        setApportsAPLForm(formattedAPL);
      }
    }
  }, [loyerConfig]);

  const handleAddCharge = useCallback(
    (targetUid: string) => {
      if (!currentMonthData || !activeHouseholdId) return;

      const newCharge: ChargeFixeForm = {
        id: nanoid(),
        householdId: activeHouseholdId,
        description: `Nouvelle Charge (${getDisplayName(targetUid)})`,
        montantTotal: 0,
        montantForm: "0",
        payeur: targetUid,
        isNew: true,
        jourPrelevementMensuel: 1,
        beneficiaires: householdUsers.map((u) => u.id),
        scope: "partage",
        categorie: "cat_autre",
      };

      setChargesFormMap((prev) => ({
        ...prev,
        [targetUid]: [...(prev[targetUid] || []), newCharge],
      }));
    },
    [currentMonthData, chargesFormMap, getDisplayName],
  );

  const updateChargeForm = useCallback(
    (targetUid: string) =>
      (id: string, field: "nom" | "montantForm", value: string) => {
        const updater = (prevCharges: ChargeFixeForm[]) =>
          prevCharges.map((charge) =>
            charge.id === id ? { ...charge, [field]: value } : charge,
          );

        setChargesFormMap((prev) => ({
          ...prev,
          [targetUid]: updater(prev[targetUid] || []),
        }));
      },
    [],
  );

  const handleDeleteCharge = useCallback(
    async (id: string, targetUid: string) => {
      const charge = chargesFormMap[targetUid]?.find((c) => c.id === id);
      if (!charge) return;
      if (!charge.isNew) {
        await deleteChargeFixe(id);
      }

      setChargesFormMap((prev) => ({
        ...prev,
        [targetUid]: prev[targetUid].filter((c) => c.id !== id),
      }));
    },
    [chargesFormMap, deleteChargeFixe],
  );

  const updateLoyerTotal = (text: string) =>
    setLoyerTotal(text.replace(",", "."));

  const updateApportsAPLForm = (uid: string, text: string) => {
    setApportsAPLForm((prev) => ({
      ...prev,
      [uid]: text.replace(",", "."),
    }));
  };

  if (
    isLoadingComptes ||
    isLoadingLoyerConfig ||
    !currentMonthData ||
    !loyerConfig ||
    householdUsers.length < 2
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const handleValidation = async () => {
    if (currentMonthData.statut === "finalisé") {
      toast.info("Attention", "Ce mois est déjà clôturé.");
      return;
    }

    const loyerNum = parseFloat(loyerTotal);
    if (isNaN(loyerNum) || loyerNum <= 0) {
      return toast.error(
        "Données invalides",
        "Le montant du loyer doit être supérieur à 0.",
      );
    }

    const allChargesForm = Object.values(chargesFormMap).flat();

    const hasEmptyChargeName = allChargesForm.some(
      (c) => !c.description || c.description.trim().length === 0,
    );
    if (hasEmptyChargeName) {
      return toast.error(
        "Données manquantes",
        "Toutes les charges doivent avoir une description.",
      );
    }

    const hasInvalidChargeAmount = allChargesForm.some((c) => {
      const val = parseFloat(c.montantForm);
      return isNaN(val) || val <= 0;
    });
    if (hasInvalidChargeAmount) {
      return toast.error(
        "Données invalides",
        "Les montants des charges doivent être supérieur à 0.",
      );
    }

    try {
      await Promise.all([
        ...allChargesForm
          .filter((c) => c.isNew)
          .map((charge) =>
            addChargeFixe({
              moisAnnee: currentMonthData.moisAnnee,
              description: charge.description || `Charge ajoutée`,
              montantTotal: parseFloat(charge.montantForm) || 0,
              payeur: charge.payeur,
              beneficiaires: householdUsers.map((u) => u.id),
              type: "fixe",
              scope: "partage",
              dateStatistiques: new Date().toISOString(),
              dateComptes: new Date().toISOString(),
              categorie: charge.categorie,
            }),
          ),
        ...allChargesForm
          .filter((c) => !c.isNew)
          .map((charge) =>
            updateChargeFixe(charge.id, parseFloat(charge.montantForm) || 0),
          ),
      ]);

      const chargesFixesSnapshot = allChargesForm.map((charge) => ({
        description: charge.description,
        montantTotal: parseFloat(charge.montantForm) || 0,
        payeur: charge.payeur,
      }));

      const apportsAPL: Record<string, number> = {};
      Object.entries(apportsAPLForm).forEach(([uid, amountString]) => {
        apportsAPL[uid] = parseFloat(amountString) || 0;
      });

      const dettesToSubmit: IDette[] = [];

      virementsAffiches.forEach((v) => {
        dettesToSubmit.push({
          debiteurUid: v.de,
          creancierUid: v.a,
          montant: v.montant,
        });
      });

      const dettesRegularisationToSubmit: IDette[] = [];

      virementsRegularisation.forEach((v) => {
        dettesRegularisationToSubmit.push({
          debiteurUid: v.de,
          creancierUid: v.a,
          montant: v.montant,
        });
      });

      const dataToSubmit: IReglementData = {
        loyerTotal: parseFloat(loyerTotal) || 0,
        apportsAPL: apportsAPL,
        dettes: dettesToSubmit,
        dettesRegularisation: dettesRegularisationToSubmit,
        loyerPayeurUid: loyerConfig.loyerPayeurUid || user.id || uid1,
        chargesFixesSnapshot: chargesFixesSnapshot,
      };

      await cloturerMois(dataToSubmit);
      navigation.navigate("SummaryRegulation");
    } catch (error) {
      toast.error("Erreur", "La clôture a échoué. " + (error as Error).message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          Statut du mois ({currentMonthData.moisAnnee}) :{" "}
          {currentMonthData.statut.toUpperCase()}
        </Text>
      </View>

      <LoyerSection
        moisDeLoyerAffiche={moisDeLoyerAffiche}
        loyerTotal={loyerTotal}
        updateLoyerTotal={updateLoyerTotal}
        householdUsers={householdUsers}
        apportsAPLForm={apportsAPLForm}
        updateApportsAPLForm={updateApportsAPLForm}
        getDisplayName={getDisplayName}
      />

      <ChargesFixesSection
        householdUsers={householdUsers}
        chargesFormMap={chargesFormMap}
        getDisplayName={getDisplayName}
        handleAddCharge={handleAddCharge}
        updateChargeForm={updateChargeForm}
        handleDeleteCharge={handleDeleteCharge}
      />

      <ChargesSection
        charges={chargesVariables}
        householdUsers={householdUsers}
        virements={virementsAffiches}
        getDisplayName={getDisplayName}
      />

      <View style={styles.validationContainer}>
        <TouchableOpacity
          style={styles.validationButton}
          onPress={handleValidation}
          disabled={isLoadingComptes}
        >
          <Text style={styles.validationButtonText}>{"Clôturer le mois"}</Text>
        </TouchableOpacity>
        {isLoadingComptes && (
          <ActivityIndicator
            size="small"
            color="#2ecc71"
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default RegulationScreen;

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
import ChargesVariablesSection from "./ChargesVariablesSection/ChargesVariablesSection";
import { useMultiUserBalance } from "hooks/useMultiUserBalance";
import { calculSimplifiedTransfers } from "utils/calculSimplifiedTransfers";
import * as DB from "../../services/firebase/db";

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
    cloturerMois,
    updateChargeFixe,
    addChargeFixe,
    deleteChargeFixe,
    isLoadingComptes,
  } = useComptes();

  const balances = useMultiUserBalance(chargesVariables, householdUsers);
  const suggestionsVirements = useMemo(() => {
    return calculSimplifiedTransfers(balances);
  }, [balances]);

  const [loyerConfig, setLoyerConfig] = useState<ILoyerConfig | null>(null);
  const [isLoadingLoyerConfig, setIsLoadingLoyerConfig] = useState(true);
  const [loyerTotal, setLoyerTotal] = useState("");
  const [apportsAPLForm, setApportsAPLForm] = useState<Record<string, string>>(
    {}
  );
  const [chargesFormMap, setChargesFormMap] = useState<
    Record<string, ChargeFixeForm[]>
  >({});
  const [dettesAjustements, setDettesAjustements] = useState<
    Record<string, string>
  >({});

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
              householdUsers.map((u) => u.id)
            );
            config = await DB.getLoyerConfig(activeHouseholdId);
          }

          setLoyerConfig(config);
        } catch (error) {
          console.error("Erreur chargement config loyer:", error);
          toast.error("Erreur", "Impossible de charger la configuration du loyer.");
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
    if (
      !loyerConfig ||
      chargesFixes.length === 0 ||
      householdUsers.length === 0
    )
      return;

    const isInitialized = Object.keys(chargesFormMap).length > 0;
    if (isInitialized) return;

    const initialChargesMap: Record<string, ChargeFixeForm[]> = {};
    householdUsers.forEach((u) => {
      const userCharges = chargesFixes
        .filter((c) => c.payeur === u.id)
        .map((c) => ({
          ...c,
          montantForm: c.montantMensuel.toString(),
          isNew: false,
        }));

      initialChargesMap[u.id] = userCharges;
    });
    setChargesFormMap(initialChargesMap);
    setLoyerTotal(loyerConfig.loyerTotal.toString());

    const initialApl: Record<string, string> = {};
    householdUsers.forEach((u) => {
      const aplAmount = loyerConfig.apportsAPL[u.id] || 0;
      initialApl[u.id] = aplAmount.toString();
    });
    setApportsAPLForm(initialApl);

  }, [loyerConfig, chargesFixes, householdUsers]);

  const handleAddCharge = useCallback(
    (targetUid: string) => {
      if (!currentMonthData || !activeHouseholdId) return;

      const newCharge: ChargeFixeForm = {
        id: nanoid(),
        householdId: activeHouseholdId,
        moisAnnee: currentMonthData.moisAnnee,
        nom: `Nouvelle Charge (${getDisplayName(targetUid)})`,
        montantMensuel: 0,
        montantForm: "0",
        payeur: targetUid,
        isNew: true,
      };

      setChargesFormMap((prev) => ({
        ...prev,
        [targetUid]: [...(prev[targetUid] || []), newCharge],
      }));
    },
    [currentMonthData, chargesFormMap, getDisplayName]
  );

  const updateChargeForm = useCallback(
    (targetUid: string) =>
      (id: string, field: "nom" | "montantForm", value: string) => {
        const updater = (prevCharges: ChargeFixeForm[]) =>
          prevCharges.map((charge) =>
            charge.id === id ? { ...charge, [field]: value } : charge
          );

        setChargesFormMap((prev) => ({
          ...prev,
          [targetUid]: updater(prev[targetUid] || []),
        }));
      },
    []
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
    [chargesFormMap, deleteChargeFixe]
  );

  const updateLoyerTotal = (text: string) =>
    setLoyerTotal(text.replace(",", "."));

  const updateApportsAPLForm = (uid: string, text: string) => {
    setApportsAPLForm((prev) => ({
      ...prev,
      [uid]: text.replace(",", "."),
    }));
  };

  const updateDettesAjustements = (key: string, text: string) => {
    setDettesAjustements((prev) => ({
      ...prev,
      [key]: text.replace(",", "."),
    }));
  };

  if (isLoadingComptes || isLoadingLoyerConfig || !currentMonthData || !loyerConfig || householdUsers.length < 2) {
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
        "Le montant du loyer doit être supérieur à 0."
      );
    }

    const allChargesForm = Object.values(chargesFormMap).flat();

    const hasEmptyChargeName = allChargesForm.some(
      (c) => !c.nom || c.nom.trim().length === 0
    );
    if (hasEmptyChargeName) {
      return toast.error(
        "Données manquantes",
        "Toutes les charges doivent avoir une description."
      );
    }

    const hasInvalidChargeAmount = allChargesForm.some((c) => {
      const val = parseFloat(c.montantForm);
      return isNaN(val) || val <= 0;
    });
    if (hasInvalidChargeAmount) {
      return toast.error(
        "Données invalides",
        "Les montants des charges doivent être supérieur à 0."
      );
    }

    try {
      await Promise.all([
        ...allChargesForm
          .filter((c) => c.isNew)
          .map((charge) =>
            addChargeFixe({
              moisAnnee: currentMonthData.moisAnnee,
              nom: charge.nom || `Charge ajoutée`,
              montantMensuel: parseFloat(charge.montantForm) || 0,
              payeur: charge.payeur,
            })
          ),
        ...allChargesForm
          .filter((c) => !c.isNew)
          .map((charge) =>
            updateChargeFixe(charge.id, parseFloat(charge.montantForm) || 0)
          ),
      ]);

      const chargesFixesSnapshot = allChargesForm.map((charge) => ({
        nom: charge.nom,
        montantMensuel: parseFloat(charge.montantForm) || 0,
        payeur: charge.payeur,
      }));

      const apportsAPL: Record<string, number> = {};
      Object.entries(apportsAPLForm).forEach(([uid, amountString]) => {
        apportsAPL[uid] = parseFloat(amountString) || 0;
      });

      const dettesToSubmit: IDette[] = [];

      suggestionsVirements.forEach((v) => {
        dettesToSubmit.push({
          debiteurUid: v.de,
          creancierUid: v.a,
          montant: v.montant,
        });
      });

      const processAjustement = (
        debUid: string,
        creUid: string,
        montant: number
      ) => {
        if (montant <= 0) return;
        const existing = dettesToSubmit.find(
          (d) => d.debiteurUid === debUid && d.creancierUid === creUid
        );
        if (existing) {
          existing.montant += montant;
        } else {
          dettesToSubmit.push({
            debiteurUid: debUid,
            creancierUid: creUid,
            montant,
          });
        }
      };

      const d1to2 =
        parseFloat(dettesAjustements[`${uid1}-${uid2}`] || "0") || 0;
      processAjustement(uid1, uid2, d1to2);

      const d2to1 =
        parseFloat(dettesAjustements[`${uid2}-${uid1}`] || "0") || 0;
      processAjustement(uid2, uid1, d2to1);

      const dataToSubmit: IReglementData = {
        loyerTotal: parseFloat(loyerTotal) || 0,
        apportsAPL: apportsAPL,
        dettes: dettesToSubmit,
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

      <ChargesVariablesSection
        chargesVariables={chargesVariables}
        householdUsers={householdUsers}
        virements={suggestionsVirements}
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

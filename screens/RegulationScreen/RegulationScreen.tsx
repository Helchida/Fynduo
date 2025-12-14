import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  RootStackNavigationProp,
  IChargeFixe,
  IDette,
  IReglementData,
  ChargeFixeForm,
} from "../../types";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { useHouseholdUsers } from "../../hooks/useHouseholdUsers";
import { nanoid } from "nanoid/non-secure";
import { styles } from "./RegulationScreen.style";
import dayjs from "dayjs";
import LoyerSection from "./LoyerSection/LoyerSection";
import ChargesFixesSection from "./ChargesFixesSection/ChargesFixesSection";
import AjustementSection from "./AjustementSection/AjustementSection";
import { confirmDeleteCharge } from "../../utils/confirmDeleteCharge";

const RegulationScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const { user } = useAuth();
  const householdId = user?.householdId;
  const { householdUsers, getDisplayName } = useHouseholdUsers();

  const {
    currentMonthData,
    chargesFixes,
    cloturerMois,
    updateChargeFixe,
    addChargeFixe,
    deleteChargeFixe,
    isLoadingComptes,
  } = useComptes();

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
    if (
      !currentMonthData ||
      chargesFixes.length === 0 ||
      householdUsers.length === 0
    )
      return;

    const isInitialized = Object.keys(chargesFormMap).length > 0;
    if (isInitialized) return;

    const initialChargesMap: Record<string, ChargeFixeForm[]> = {};
    const initialApl: Record<string, string> = {};

    householdUsers.forEach((u) => {
      const userCharges = chargesFixes
        .filter((c) => c.payeur === u.id)
        .map((c) => ({
          ...c,
          montantForm: c.montantMensuel.toString(),
          isNew: false,
        }));

      initialChargesMap[u.id] = userCharges;

      const aplAmount = currentMonthData.apportsAPL[u.id] || 0;
      initialApl[u.id] = aplAmount.toString();
    });

    setChargesFormMap(initialChargesMap);
    setApportsAPLForm(initialApl);

    setLoyerTotal(currentMonthData.loyerTotal.toString());
  }, [currentMonthData, chargesFixes, householdUsers]);

  const handleAddCharge = useCallback(
    (targetUid: string) => {
      if (!currentMonthData || !householdId) return;

      const newCharge: ChargeFixeForm = {
        id: nanoid(),
        householdId: householdId,
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
    [currentMonthData, getDisplayName]
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
    (id: string, targetUid: string) => {
      const charge = chargesFormMap[targetUid]?.find((c) => c.id === id);
      if (!charge) return;

      confirmDeleteCharge(charge.nom, async () => {
        if (!charge.isNew) {
          await deleteChargeFixe(id);
        }

        setChargesFormMap((prev) => ({
          ...prev,
          [targetUid]: prev[targetUid].filter((c) => c.id !== id),
        }));
      });
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

  if (isLoadingComptes || !currentMonthData || householdUsers.length < 2) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const handleValidation = async () => {
    if (currentMonthData.statut === "finalisé") {
      Alert.alert("Attention", "Ce mois est déjà clôturé.");
      return;
    }

    try {
      const allCharges = Object.values(chargesFormMap).flat();
      const newCharges = allCharges.filter((c) => c.isNew);
      const existingCharges = allCharges.filter((c) => !c.isNew);

      await Promise.all(
        newCharges.map((charge) => {
          const newChargeData: Omit<IChargeFixe, "id" | "householdId"> = {
            moisAnnee: currentMonthData.moisAnnee,
            nom: charge.nom || `Charge ajoutée (${charge.payeur})`,
            montantMensuel: parseFloat(charge.montantForm) || 0,
            payeur: charge.payeur,
          };
          return addChargeFixe(newChargeData);
        })
      );

      await Promise.all(
        existingCharges.map((charge) =>
          updateChargeFixe(charge.id, parseFloat(charge.montantForm) || 0)
        )
      );

      const apportsAPL: Record<string, number> = {};
      Object.entries(apportsAPLForm).forEach(([uid, amountString]) => {
        apportsAPL[uid] = parseFloat(amountString) || 0;
      });

      const dettesToSubmit: IDette[] = [];

      const key1to2 = `${uid1}-${uid2}`;
      const d1to2 = parseFloat(dettesAjustements[key1to2] || "0") || 0;
      if (d1to2 > 0) {
        dettesToSubmit.push({
          debiteurUid: uid1,
          creancierUid: uid2,
          montant: d1to2,
        });
      }

      const key2to1 = `${uid2}-${uid1}`;
      const d2to1 = parseFloat(dettesAjustements[key2to1] || "0") || 0;
      if (d2to1 > 0) {
        dettesToSubmit.push({
          debiteurUid: uid2,
          creancierUid: uid1,
          montant: d2to1,
        });
      }

      const dataToSubmit: IReglementData = {
        loyerTotal: parseFloat(loyerTotal) || 0,
        apportsAPL: apportsAPL,
        dettes: dettesToSubmit,
        loyerPayeurUid: currentMonthData.loyerPayeurUid || user?.id || uid1,
      };

      await cloturerMois(dataToSubmit);
      navigation.navigate("SummaryRegulation");
    } catch (error) {
      Alert.alert(
        "Erreur de Clôture",
        "La clôture a échoué. " + (error as Error).message
      );
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

      <AjustementSection
        householdUsers={householdUsers}
        uid1={uid1}
        uid2={uid2}
        dettesAjustements={dettesAjustements}
        updateDettesAjustements={updateDettesAjustements}
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

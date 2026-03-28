import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { styles } from "./EpargneScreen.style";
import {
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  PlusCircle,
} from "lucide-react-native";
import dayjs from "dayjs";
import { useAuth } from "../../hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useToast } from "hooks/useToast";
import { addTirelire, placeEpargne } from "../../services/supabase/db";
import { useEpargneData } from "../../hooks/useEpargneData";

const EpargneScreen: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const [selectedDate, setSelectedDate] = useState(
    dayjs().subtract(1, "month"),
  );
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDispatchModalVisible, setIsDispatchModalVisible] = useState(false);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [newTirelire, setNewTirelire] = useState({ nom: "", objectif: "" });

  const { revenus, charges } = useComptes();
  const moisCle = selectedDate.format("YYYY-MM");

  const { tirelires, dejaPlaceCeMois, loading, refresh } = useEpargneData(
    user.id,
    moisCle,
  );

  console.log("ID Utilisateur actuel:", user?.id);
  console.log("Nombre de tirelires reçues:", tirelires.length);

  useEffect(() => {
    if (user?.id) {
      refresh();
    }
  }, [user?.id, moisCle, refresh]);

  const statsMois = useMemo(() => {
    const moisKey = selectedDate.format("YYYY-MM");
    const isSoloMode = user.activeHouseholdId === user.id;

    const monthCharges = charges.filter((c) => {
      const isSameMonth =
        dayjs(c.dateStatistiques).format("YYYY-MM") === moisKey;
      const isNotRegul = !(
        c.type === "variable" && c.categorie === "cat_remboursement"
      );
      return isSameMonth && isNotRegul;
    });

    let totalDepenses = 0;
    monthCharges.forEach((c) => {
      const montant = Number(c.montantTotal) || 0;
      if (isSoloMode && c.beneficiaires?.length > 0) {
        if (c.beneficiaires.includes(user.id)) {
          totalDepenses += montant / c.beneficiaires.length;
        }
      } else {
        totalDepenses += montant;
      }
    });

    const monthRevenus = revenus.filter(
      (r) => dayjs(r.dateReception).format("YYYY-MM") === moisKey,
    );

    let totalRevenus = 0;
    monthRevenus.forEach((r) => {
      totalRevenus += Number(r.montant) || 0;
    });

    return {
      revenus: totalRevenus,
      depenses: totalDepenses,
      solde: totalRevenus - totalDepenses,
    };
  }, [selectedDate, charges, revenus, user]);

  const epargneDisponible = useMemo(() => {
    if (loading) return 0;

    const dispo = statsMois.solde - dejaPlaceCeMois;
    return dispo > 0 ? dispo : 0;
  }, [statsMois.solde, dejaPlaceCeMois, loading]);

  const isPositive = statsMois.solde > 0;
  const statusColor = isPositive ? "#27ae60" : "#e74c3c";

  const isMonthFinished = selectedDate.isBefore(dayjs().startOf("month"));
  const isLatestPossibleMonth = selectedDate.isSame(
    dayjs().subtract(1, "month"),
    "month",
  );


  const handlePlaceEpargne = async (tirelireId: string) => {
    const montant = parseFloat(montantSaisi.replace(",", "."));
    const tirelire = tirelires.find((t) => t.id === tirelireId);

    if (isNaN(montant) || montant <= 0) {
      return toast.error(
        "Montant invalide",
        "Veuillez entrer un chiffre positif.",
      );
    }

    if (montant > epargneDisponible + 0.01) {
      return toast.warning(
        "Solde insuffisant",
        `Il ne vous reste que ${epargneDisponible.toFixed(2)}€ à placer.`,
      );
    }

    if (tirelire && montant + tirelire.montantActuel > tirelire.objectif) {
      const reste = tirelire.objectif - tirelire.montantActuel;
      return toast.info(
        "Objectif atteint",
        `Cette tirelire n'a besoin que de ${reste.toFixed(2)}€.`,
      );
    }

    try {
      await placeEpargne(user.id, tirelireId, montant, moisCle);
      toast.success(
        "Épargne placée !",
        `${montant}€ ajoutés à ${tirelire?.description}`,
      );
      setMontantSaisi("");
      setIsDispatchModalVisible(false);
      refresh();
    } catch (e) {
      toast.error("Erreur", "Impossible d'enregistrer le placement.");
    }
  };

  const handleAddTirelire = async () => {
    if (newTirelire.nom.trim() === "" || !newTirelire.objectif) {
      return toast.error(
        "Formulaire incomplet",
        "Veuillez remplir tous les champs.",
      );
    }

    try {
      const budget = parseFloat(newTirelire.objectif.replace(",", "."));

      if (isNaN(budget)) {
        return toast.error(
          "Format invalide",
          "L'objectif doit être un nombre.",
        );
      }

      await addTirelire(user.id, {
        description: newTirelire.nom,
        objectif: budget,
      });

      toast.success("Succès", "Nouvel objectif créé !");
      setIsAddModalVisible(false);
      setNewTirelire({ nom: "", objectif: "" });
      refresh();
    } catch (e: any) {
      console.error("DEBUG CREATION TIRELIRE:", e);

      toast.error("Erreur", e.message || "La création a échoué.");
    }
  };

  if (loading && tirelires.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => setSelectedDate(selectedDate.subtract(1, "month"))}
        >
          <ChevronLeft size={24} color="#2c3e50" />
        </TouchableOpacity>

        <Text style={styles.monthLabel}>
          {selectedDate.format("MMMM YYYY")}
        </Text>

        <TouchableOpacity
          style={[styles.monthArrow, isLatestPossibleMonth && { opacity: 0.3 }]}
          onPress={() => {
            if (!isLatestPossibleMonth)
              setSelectedDate(selectedDate.add(1, "month"));
          }}
          disabled={isLatestPossibleMonth}
        >
          <ChevronRight size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainSavingsCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardLabel}>Capacité d'épargne</Text>
          {isPositive ? (
            <TrendingUp size={20} color={statusColor} />
          ) : (
            <AlertCircle size={20} color={statusColor} />
          )}
        </View>

        <Text style={[styles.bigAmount, { color: statusColor }]}>
          {loading ? "..." : `${epargneDisponible.toFixed(2)}€`}
        </Text>

        <View style={styles.miniStatsRow}>
          <View>
            <Text style={styles.miniStatLabel}>Total Revenus</Text>
            <Text style={styles.miniStatValue}>
              {statsMois.revenus.toFixed(0)}€
            </Text>
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={styles.miniStatLabel}>Total Dépenses</Text>
            <Text style={styles.miniStatValue}>
              {statsMois.depenses.toFixed(0)}€
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.titleWithIcon}>
          <PiggyBank size={22} color="#2c3e50" />
          <Text style={styles.sectionTitle}>Mes Tirelires</Text>
        </View>
      </View>

      {!isPositive || !isMonthFinished ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            {!isMonthFinished
              ? "Attendez la fin du mois pour placer votre épargne."
              : "Solde insuffisant pour épargner ce mois-ci."}
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.dispatchButton,
              epargneDisponible <= 0 && { opacity: 0.5 },
            ]}
            onPress={() =>
              epargneDisponible > 0 && setIsDispatchModalVisible(true)
            }
            disabled={epargneDisponible <= 0}
          >
            <Text style={styles.dispatchButtonText}>
              Placer les {epargneDisponible.toFixed(2)}€
            </Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.tireliresList}>
            {tirelires.map((item) => {
              const progression = Math.min(
                (item.montantActuel / item.objectif) * 100,
                100,
              );

              return (
                <View key={item.id} style={styles.tirelireCard}>
                  <View style={styles.tirelireHeader}>
                    <Text style={styles.tirelireName}>{item.description}</Text>
                    <Text style={styles.tirelireAmount}>
                      {item.montantActuel.toFixed(0)}€{" "}
                      <Text style={styles.objectivSmall}>
                        / {item.objectif}€
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View
                      style={[styles.progressBar, { width: `${progression}%` }]}
                    />
                  </View>

                  <Text style={styles.remainingText}>
                    {item.montantActuel >= item.objectif
                      ? "Objectif atteint ! 🎉"
                      : `Il manque ${(item.objectif - item.montantActuel).toFixed(0)}€`}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.addButtonSecondary}
            onPress={() => setIsAddModalVisible(true)}
          >
            <PlusCircle size={20} color="#3498db" />
            <Text style={styles.addButtonSecondaryText}>
              Créer un nouvel objectif
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvel Objectif 🎯</Text>
            <Text style={styles.inputLabel}>Nom du projet</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Voyage Japon"
              value={newTirelire.nom}
              onChangeText={(t) => setNewTirelire({ ...newTirelire, nom: t })}
            />
            <Text style={styles.inputLabel}>Budget total (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 1200"
              keyboardType="numeric"
              value={newTirelire.objectif}
              onChangeText={(t) =>
                setNewTirelire({ ...newTirelire, objectif: t })
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={handleAddTirelire}
              >
                <Text style={styles.btnConfirmText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isDispatchModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Placer de l'argent</Text>
            <Text
              style={{
                textAlign: "center",
                marginBottom: 20,
                color: "#7f8c8d",
              }}
            >
              Disponible ce mois : {epargneDisponible.toFixed(2)}€
            </Text>

            <Text style={styles.inputLabel}>Montant à placer (€)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              autoFocus
              placeholder="ex: 100"
              value={montantSaisi}
              onChangeText={setMontantSaisi}
            />

            <Text style={styles.inputLabel}>Vers quelle tirelire ?</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {tirelires.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.dispatchItem}
                  onPress={() => handlePlaceEpargne(t.id)}
                >
                  <Text style={styles.dispatchItemName}>{t.description}</Text>
                  <Text style={styles.dispatchItemReste}>
                    Reste {(t.objectif - t.montantActuel).toFixed(0)}€
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.btnCancel, { marginTop: 15 }]}
              onPress={() => setIsDispatchModalVisible(false)}
            >
              <Text style={styles.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EpargneScreen;

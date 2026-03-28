import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
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

const EpargneScreen: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const [tirelires, setTirelires] = useState([
    { id: "1", nom: "Vacances", actuel: 0, objectif: 1000, icone: "plane" },
    { id: "2", nom: "Cadeaux Noël", actuel: 0, objectif: 500, icone: "gift" },
  ]);

  const [selectedDate, setSelectedDate] = useState(
    dayjs().subtract(1, "month"),
  );
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTirelire, setNewTirelire] = useState({
    nom: "",
    objectif: "",
    dateFin: "",
  });
  const [isDispatchModalVisible, setIsDispatchModalVisible] = useState(false);
  const [epargneDejaPlacee, setEpargneDejaPlacee] = useState<
    Record<string, number>
  >({});

  const { revenus, charges } = useComptes();

  const [montantSaisi, setMontantSaisi] = useState("");

  const distribuerEpargne = (tirelireId: string) => {
    const montant = parseFloat(montantSaisi);
    const tirelireCible = tirelires.find((t) => t.id === tirelireId);

    if (isNaN(montant) || montant <= 0) {
      toast.error("Montant invalide", "Veuillez entrer un chiffre positif.");
      return;
    }

    if (montant > epargneDisponible) {
      toast.warning(
        "Solde insuffisant",
        `Il ne vous reste que ${epargneDisponible.toFixed(0)}€ à placer.`,
      );
      return;
    }

    if (tirelireCible) {
      const resteAremplir = tirelireCible.objectif - tirelireCible.actuel;
      if (montant > resteAremplir) {
        toast.info(
          "Objectif atteint",
          `Cette tirelire n'a besoin que de ${resteAremplir.toFixed(0)}€.`,
        );
        return;
      }
    }

    setTirelires((prev) =>
      prev.map((t) =>
        t.id === tirelireId ? { ...t, actuel: t.actuel + montant } : t,
      ),
    );

    const moisCle = selectedDate.format("YYYY-MM");
    setEpargneDejaPlacee((prev) => ({
      ...prev,
      [moisCle]: (prev[moisCle] || 0) + montant,
    }));

    toast.success(
      "Épargne placée !",
      `${montant}€ ajoutés à ${tirelireCible?.nom}`,
    );
    setIsDispatchModalVisible(false);
    setMontantSaisi("");
  };

  const ajouterNouvelleTirelire = () => {
    if (newTirelire.nom.trim() === "" || !newTirelire.objectif) {
      toast.error("Formulaire incomplet", "Veuillez remplir tous les champs.");
      return;
    }

    const nouvelle = {
      id: Math.random().toString(),
      nom: newTirelire.nom,
      actuel: 0,
      objectif: parseFloat(newTirelire.objectif),
      icone: "target",
    };

    setTirelires([...tirelires, nouvelle]);

    setNewTirelire({ nom: "", objectif: "", dateFin: "" });
    setIsAddModalVisible(false);
  };

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

    const soldeReel = totalRevenus - totalDepenses;

    return {
      revenus: totalRevenus,
      depenses: totalDepenses,
      solde: soldeReel,
    };
  }, [selectedDate, charges, revenus, user]);

  const moisCle = selectedDate.format("YYYY-MM");
  const dejaPlaceCeMois = epargneDejaPlacee[moisCle] || 0;
  const epargneDisponible =
    statsMois.solde > 0 ? statsMois.solde - dejaPlaceCeMois : 0;

  const isPositive = statsMois.solde > 0;
  const statusColor = isPositive ? "#27ae60" : "#e74c3c";
  const isMonthFinished = selectedDate.isBefore(dayjs().startOf("month"));
  const isLatestPossibleMonth = selectedDate.isSame(
    dayjs().subtract(1, "month"),
    "month",
  );

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
            if (!isLatestPossibleMonth) {
              setSelectedDate(selectedDate.add(1, "month"));
            }
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
          {epargneDisponible.toFixed(2)}€
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
            style={styles.dispatchButton}
            onPress={() => setIsDispatchModalVisible(true)}
          >
            <Text style={styles.dispatchButtonText}>
              Placer les {epargneDisponible.toFixed(0)}€
            </Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.tireliresList}>
            {tirelires.map((item) => {
              const progression = (item.actuel / item.objectif) * 100;

              return (
                <TouchableOpacity key={item.id} style={styles.tirelireCard}>
                  <View style={styles.tirelireHeader}>
                    <Text style={styles.tirelireName}>{item.nom}</Text>
                    <Text style={styles.tirelireAmount}>
                      {item.actuel}€{" "}
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
                    Il manque {(item.objectif - item.actuel).toFixed(0)}€
                  </Text>
                </TouchableOpacity>
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
              placeholder="ex: Voyage Japon, Nouveau PC..."
              value={newTirelire.nom}
              onChangeText={(text) =>
                setNewTirelire({ ...newTirelire, nom: text })
              }
            />

            <Text style={styles.inputLabel}>Budget total (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 1200"
              keyboardType="numeric"
              value={newTirelire.objectif}
              onChangeText={(text) =>
                setNewTirelire({ ...newTirelire, objectif: text })
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
                onPress={ajouterNouvelleTirelire}
              >
                <Text style={styles.btnConfirmText}>Créer la tirelire</Text>
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
              style={[
                styles.cardLabel,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              Disponible : {epargneDisponible.toFixed(2)}€
            </Text>

            <Text style={styles.inputLabel}>Montant à placer (€)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="ex: 100"
              value={montantSaisi}
              onChangeText={setMontantSaisi}
            />

            <Text style={styles.inputLabel}>Choisir la tirelire</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {tirelires.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.dispatchItem}
                  onPress={() => distribuerEpargne(t.id)}
                >
                  <Text style={styles.dispatchItemName}>{t.nom}</Text>
                  <Text style={styles.dispatchItemReste}>
                    Manque {(t.objectif - t.actuel).toFixed(0)}€
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

import React, { useState, useMemo, useEffect } from "react";
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
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Pencil,
  Trash2,
  Hammer,
  Coins,
  Briefcase,
} from "lucide-react-native";
import dayjs from "dayjs";
import { useAuth } from "../../hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useToast } from "hooks/useToast";
import {
  addTirelire,
  breakTirelire,
  deleteTirelire,
  placeEpargne,
  updateTirelire,
} from "../../services/supabase/db";
import { useEpargneData } from "../../hooks/useEpargneData";
import { ITirelire } from "@/types";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";

const EpargneScreen: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDispatchModalVisible, setIsDispatchModalVisible] = useState(false);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [newTirelire, setNewTirelire] = useState({
    nom: "",
    objectif: "",
    montantInitial: "",
  });
  const [editingTirelire, setEditingTirelire] = useState<ITirelire | null>(
    null,
  );
  const [tirelireToDelete, setTirelireToDelete] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isBreakConfirmVisible, setIsBreakConfirmVisible] = useState(false);
  const [selectedTirelireForBreak, setSelectedTirelireForBreak] =
    useState<ITirelire | null>(null);
  const [montantRetrait, setMontantRetrait] = useState("");
  const [isBreakModalVisible, setIsBreakModalVisible] = useState(false);

  const { revenus, charges, loadData } = useComptes();
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

    const monthRevenus = revenus.filter((r) => {
      const isSameMonth = dayjs(r.dateReception).format("YYYY-MM") === moisKey;
      const isNotRetraitEpargne = r.categorie !== "cat_retrait_epargne";
      return isSameMonth && isNotRetraitEpargne;
    });

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

  const totalCumuleTirelires = useMemo(() => {
    return tirelires.reduce((sum, t) => sum + (t.montantActuel || 0), 0);
  }, [tirelires]);

  const isPositive = statsMois.solde > 0;
  const statusColor = isPositive ? "#27ae60" : "#e74c3c";

  const isMonthFinished = selectedDate.isBefore(
    dayjs().add(1, "month").startOf("month"),
  );
  const isLatestPossibleMonth = selectedDate.isSame(dayjs(), "month");
  const isCurrentMonth = selectedDate.isSame(dayjs(), "month");

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

      const montantInitial = parseFloat(
        newTirelire.montantInitial.replace(",", "."),
      );

      if (isNaN(montantInitial)) {
        return toast.error(
          "Format invalide",
          "Le montant initial doit être un nombre.",
        );
      }

      await addTirelire(user.id, {
        description: newTirelire.nom,
        objectif: budget,
        montantInitial:
          parseFloat(newTirelire.montantInitial.replace(",", ".")) || 0,
      });

      toast.success("Succès", "Nouvel objectif créé !");
      setIsAddModalVisible(false);
      setNewTirelire({ nom: "", objectif: "", montantInitial: "" });
      refresh();
    } catch (e: any) {
      toast.error("Erreur", e.message || "La création a échoué.");
    }
  };

  const handleUpdateTirelire = async () => {
    if (!editingTirelire) return;

    try {
      const budget = parseFloat(newTirelire.objectif.replace(",", "."));
      const initial = parseFloat(newTirelire.montantInitial.replace(",", "."));

      if (isNaN(budget) || isNaN(initial)) {
        return toast.error(
          "Format invalide",
          "Veuillez entrer des nombres valides.",
        );
      }

      await updateTirelire(editingTirelire.id, {
        description: newTirelire.nom,
        objectif: budget,
        montant_initial: initial,
      });

      toast.success("Mis à jour", "Tirelire modifiée avec succès.");

      setIsAddModalVisible(false);
      setEditingTirelire(null);
      setNewTirelire({ nom: "", objectif: "", montantInitial: "" });

      refresh();
    } catch (e) {
      console.error(e);
      toast.error("Erreur", "Impossible de modifier la tirelire.");
    }
  };

  const openDeleteModal = (id: string) => {
    setTirelireToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!tirelireToDelete) return;
    try {
      await deleteTirelire(tirelireToDelete);
      toast.success("Supprimé", "La tirelire a été supprimée.");
      refresh();
    } catch (e) {
      toast.error("Erreur", "Impossible de supprimer la tirelire.");
    } finally {
      setIsDeleteModalVisible(false);
      setTirelireToDelete(null);
    }
  };

  const openEditModal = (tirelire: ITirelire) => {
    setEditingTirelire(tirelire);
    setNewTirelire({
      nom: tirelire.description,
      objectif: tirelire.objectif.toString(),
      montantInitial: tirelire.montantInitial.toString(),
    });
    setIsAddModalVisible(true);
  };

  const handleConfirmBreak = async () => {
    if (!selectedTirelireForBreak) return;

    const montant = parseFloat(montantRetrait.replace(",", "."));

    if (isNaN(montant) || montant <= 0) {
      return toast.error(
        "Montant invalide",
        "Veuillez entrer un chiffre positif.",
      );
    }

    if (montant > selectedTirelireForBreak.montantActuel + 0.01) {
      return toast.warning(
        "Solde insuffisant",
        `Cette tirelire ne contient que ${selectedTirelireForBreak.montantActuel.toFixed(2)}€.`,
      );
    }

    try {
      await breakTirelire(user.id, selectedTirelireForBreak, montant);

      toast.success(
        "Argent récupéré !",
        `${montant.toFixed(2)}€ ont été ajoutés à vos revenus de ce mois.`,
      );

      await loadData();

      setIsBreakModalVisible(false);
      setSelectedTirelireForBreak(null);
      setMontantRetrait("");
      refresh();
    } catch (e) {
      toast.error("Erreur", "Impossible de casser la tirelire.");
    }
  };

  const openBreakModal = (tirelire: ITirelire) => {
    setSelectedTirelireForBreak(tirelire);
    setMontantRetrait("");
    setIsBreakModalVisible(true);
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

        <View style={{ alignItems: "center" }}>
          <Text style={styles.monthLabel}>
            {selectedDate.format("MMMM YYYY")}
          </Text>
          {isCurrentMonth && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#27ae60",
                  marginRight: 6,
                }}
              />
              <Text
                style={{ fontSize: 12, color: "#27ae60", fontWeight: "600" }}
              >
                Mois en cours
              </Text>
            </View>
          )}
        </View>

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
            <Coins size={20} color={statusColor} />
          ) : (
            <AlertCircle size={20} color={statusColor} />
          )}
        </View>

        <Text style={[styles.bigAmount, { color: statusColor }]}>
          {loading ? "..." : `${epargneDisponible.toFixed(2)}€`}
        </Text>

        {isCurrentMonth && (
          <View
            style={{
              backgroundColor: "#fcf3cf",
              padding: 8,
              borderRadius: 8,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <AlertCircle size={16} color="#f39c12" />
            <Text
              style={{
                fontSize: 12,
                color: "#d35400",
                marginLeft: 8,
                flex: 1,
                fontStyle: "italic",
              }}
            >
              Le mois n'est pas fini. Ce montant peut varier selon vos dépenses
              à venir.
            </Text>
          </View>
        )}

        <View style={styles.miniStatsRow}>
          <View>
            <Text style={styles.miniStatLabel}>Total Revenus</Text>
            <Text style={styles.miniStatValue}>
              {statsMois.revenus.toFixed(2)}€
            </Text>
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={styles.miniStatLabel}>Total Dépenses</Text>
            <Text style={styles.miniStatValue}>
              {statsMois.depenses.toFixed(2)}€
            </Text>
          </View>
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
              epargneDisponible <= 0.0 && { opacity: 0.5 },
            ]}
            onPress={() =>
              epargneDisponible > 0.0 && setIsDispatchModalVisible(true)
            }
            disabled={epargneDisponible <= 0.0}
          >
            <Text style={styles.dispatchButtonText}>
              Placer les {epargneDisponible.toFixed(2)}€
            </Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <PiggyBank size={22} color="#2c3e50" />
              <Text style={styles.sectionTitle}>Mes Tirelires</Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              marginHorizontal: 20,
              marginBottom: 15,
              padding: 15,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: "#ecf0f1",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: "#7f8c8d",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Épargne Totale Accumulée
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#2c3e50",
                  marginTop: 4,
                }}
              >
                {totalCumuleTirelires.toFixed(2)}€
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#ebf5fb",
                padding: 10,
                borderRadius: 50,
              }}
            >
              <Briefcase size={24} color="#3498db" />
            </View>
          </View>

          <View style={styles.tireliresList}>
            {tirelires.map((item) => {
              const progression = Math.min(
                (item.montantActuel / item.objectif) * 100,
                100,
              );

              return (
                <View key={item.id} style={styles.tirelireCard}>
                  <View style={styles.tirelireHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tirelireName}>
                        {item.description}
                      </Text>
                      <Text style={styles.tirelireAmount}>
                        {item.montantActuel.toFixed(2)}€{" "}
                        <Text style={styles.objectivSmall}>
                          / {item.objectif}€
                        </Text>
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 15 }}>
                      <TouchableOpacity onPress={() => openBreakModal(item)}>
                        <Hammer size={18} color="#e67e22" />{" "}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openEditModal(item)}>
                        <Pencil size={18} color="#3498db" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openDeleteModal(item.id)}
                      >
                        <Trash2 size={18} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View
                      style={[styles.progressBar, { width: `${progression}%` }]}
                    />
                  </View>

                  <Text style={styles.remainingText}>
                    {item.montantActuel >= item.objectif
                      ? "Objectif atteint ! 🎉"
                      : `Il manque ${(item.objectif - item.montantActuel).toFixed(2)}€`}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {editingTirelire ? (
                <Pencil size={22} color="#3498db" />
              ) : (
                <PiggyBank size={22} color="#2c3e50" />
              )}
              <Text style={[styles.modalTitle, { marginBottom: 0 }]}>
                {editingTirelire ? "Modifier l'objectif" : "Nouvel Objectif"}
              </Text>
            </View>
            <Text style={styles.inputLabel}>Nom du projet</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Voyage Japon"
              value={newTirelire.nom}
              onChangeText={(t) => setNewTirelire({ ...newTirelire, nom: t })}
            />
            <Text style={styles.inputLabel}>Montant initial (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 2000"
              keyboardType="decimal-pad"
              value={newTirelire.montantInitial}
              onChangeText={(t) =>
                setNewTirelire({ ...newTirelire, montantInitial: t })
              }
            />
            <Text style={styles.inputLabel}>Budget total (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 1200"
              keyboardType="decimal-pad"
              value={newTirelire.objectif}
              onChangeText={(t) =>
                setNewTirelire({ ...newTirelire, objectif: t })
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setEditingTirelire(null);
                  setNewTirelire({ nom: "", objectif: "", montantInitial: "" });
                }}
              >
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={
                  editingTirelire ? handleUpdateTirelire : handleAddTirelire
                }
              >
                <Text style={styles.btnConfirmText}>
                  {editingTirelire ? "Modifier" : "Créer"}
                </Text>
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
              keyboardType="decimal-pad"
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

      <Modal
        visible={isBreakModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <Hammer size={24} color="#e67e22" />
              <Text style={[styles.modalTitle, { marginBottom: 0 }]}>
                Casser la tirelire
              </Text>
            </View>

            <Text
              style={{
                textAlign: "center",
                marginBottom: 15,
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              Tirelire : "{selectedTirelireForBreak?.description}"
            </Text>
            <Text
              style={{
                textAlign: "center",
                marginBottom: 20,
                color: "#27ae60",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Contenu actuel :{" "}
              {selectedTirelireForBreak?.montantActuel.toFixed(2)}€
            </Text>

            <Text style={styles.inputLabel}>
              Combien voulez-vous retirer ? (€)
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="0.00"
              value={montantRetrait}
              onChangeText={setMontantRetrait}
            />

            <View
              style={{
                backgroundColor: "#fdf2e9",
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#d35400",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Ce montant sera retiré de la tirelire et ajouté à vos revenus de
                ce mois afin de couvrir votre dépense réelle.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => {
                  setIsBreakModalVisible(false);
                  setSelectedTirelireForBreak(null);
                  setMontantRetrait("");
                }}
              >
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnConfirm, { backgroundColor: "#e67e22" }]}
                onPress={handleConfirmBreak}
              >
                <Text style={styles.btnConfirmText}>Retirer l'argent</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={isDeleteModalVisible}
        title="Supprimer la tirelire"
        message="Voulez-vous vraiment supprimer cette tirelire ? L'argent placé redeviendra disponible dans vos soldes mensuels."
        confirmText="Supprimer"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setTirelireToDelete(null);
        }}
      />

      <ConfirmModal
        visible={isBreakConfirmVisible}
        title="Confirmer le retrait"
        message={`Voulez-vous vraiment retirer ${montantSaisi}€ de la tirelire "${selectedTirelireForBreak?.description}" ? Ce montant sera ajouté à vos revenus de ce mois.`}
        confirmText="Retirer l'argent"
        onConfirm={handleConfirmBreak}
        onCancel={() => setIsBreakConfirmVisible(false)}
      />
    </ScrollView>
  );
};

export default EpargneScreen;

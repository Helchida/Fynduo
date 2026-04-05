import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { styles } from "./EpargneScreen.style";
import {
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  PlusCircle,
  Pencil,
  Trash2,
  Hammer,
  HandCoins,
  Coins,
  Briefcase,
  GripVertical,
  Zap,
  Unlock,
  Lock,
} from "lucide-react-native";
import dayjs from "dayjs";
import { useAuth } from "../../hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useToast } from "hooks/useToast";
import {
  addTirelire,
  breakCascade,
  breakSubTirelire,
  breakTirelire,
  deleteTirelire,
  placeEpargne,
  updateSubTireliresOrder,
  updateTirelire,
} from "../../services/supabase/db";
import { useEpargneData } from "../../hooks/useEpargneData";
import { ITirelire, RootStackNavigationProp } from "@/types";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { useNavigation } from "@react-navigation/native";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const formatCurrency = (amount: number) => {
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace(/,/g, ".") + "€"
  );
};

const EpargneScreen: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const navigation = useNavigation<RootStackNavigationProp>();
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
  const [isBreakModalVisible, setIsBreakModalVisible] = useState(false);
  const [isChooseTirelireToBreak, setIsChooseTirelireToBreak] = useState(false);
  const [cagnottesOfTirelireToBreak, setCagnottesOfTirelireToBreak] = useState<
    ITirelire[]
  >([]);

  const { revenus, charges, loadData } = useComptes();
  const moisCle = selectedDate.format("YYYY-MM");

  const {
    tirelires,
    dejaPlaceCeMois,
    loading,
    refresh,
    getCagnottes,
    updateLocalTirelire,
  } = useEpargneData(user.id, moisCle);

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
      const isNotEpargneRetrait = r.categorie !== "cat_retrait_epargne";
      return isSameMonth && isNotEpargneRetrait;
    });

    const monthRetraitEpargne = revenus.filter((r) => {
      const isSameMonth = dayjs(r.dateReception).format("YYYY-MM") === moisKey;
      const isEpargneRetrait = r.categorie === "cat_retrait_epargne";
      return isSameMonth && isEpargneRetrait;
    });

    let totalRevenus = 0;
    monthRevenus.forEach((r) => {
      totalRevenus += Number(r.montant) || 0;
    });

    let totalRetraits = 0;
    monthRetraitEpargne.forEach((r) => {
      totalRetraits += Number(r.montant) || 0;
    });

    return {
      revenus: totalRevenus,
      depenses: totalDepenses,
      solde: totalRevenus - totalDepenses,
      retraits: totalRetraits,
    };
  }, [selectedDate, charges, revenus, user]);

  const epargneDisponible = useMemo(() => {
    if (loading) return 0;

    const dispo = statsMois.solde - dejaPlaceCeMois;
    return dispo;
  }, [statsMois.solde, dejaPlaceCeMois, loading]);

  const totalCumuleTirelires = useMemo(() => {
    return tirelires.reduce((sum, t) => sum + (t.montantActuel || 0), 0);
  }, [tirelires]);

  const isPositive = epargneDisponible > 0;
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
        `Il ne vous reste que ${formatCurrency(epargneDisponible)} à placer.`,
      );
    }

    if (tirelire && montant + tirelire.montantActuel > tirelire.objectif) {
      const reste = tirelire.objectif - tirelire.montantActuel;
      return toast.info(
        "Objectif atteint",
        `Cette tirelire n'a besoin que de ${formatCurrency(reste)}.`,
      );
    }

    try {
      await placeEpargne(user.id, tirelireId, montant, moisCle);
      toast.success(
        "Épargne placée !",
        `${formatCurrency(montant)} ajoutés à ${tirelire?.description}`,
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

  const handleUpdateIsLocked = async (
    tirelireId: string,
    isLocked: boolean,
  ) => {
    updateLocalTirelire(tirelireId, { isLocked: isLocked });

    try {
      await updateTirelire(tirelireId, { is_locked: isLocked });
    } catch (e) {
      updateLocalTirelire(tirelireId, { isLocked: !isLocked });
      toast.error("Erreur", "Impossible de mettre à jour le verrouillage.");
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

  const handleConfirmBreak = async (tirelireToBreak: ITirelire) => {
    let realTirelireMovement: ITirelire = tirelireToBreak;
    if (tirelireToBreak.parentId !== null) {
      realTirelireMovement =
        tirelires.find((t) => t.id === tirelireToBreak.parentId) ||
        tirelireToBreak;
    }

    const montant = parseFloat(montantSaisi.replace(",", "."));

    if (isNaN(montant) || montant <= 0) {
      return toast.error(
        "Montant invalide",
        "Veuillez entrer un chiffre positif.",
      );
    }

    if (montant > realTirelireMovement.montantActuel + 0.01) {
      return toast.warning(
        "Solde insuffisant",
        `Cette tirelire ne contient que ${formatCurrency(realTirelireMovement.montantActuel)}.`,
      );
    }

    try {
      if (tirelireToBreak.parentId !== null) {
        await breakSubTirelire(tirelireToBreak.id, montant);
      }
      await breakTirelire(user.id, realTirelireMovement, montant);

      toast.success(
        "Argent récupéré !",
        `${formatCurrency(montant)} ont été ajoutés à vos revenus de ce mois.`,
      );

      await loadData();

      setIsBreakModalVisible(false);
      setMontantSaisi("");
      refresh();
    } catch (e) {
      toast.error("Erreur", "Impossible de casser la tirelire.");
    }
  };

  const handleConfirmBreakLessImportant = async () => {
    const montant = parseFloat(montantSaisi.replace(",", "."));

    if (isNaN(montant) || montant <= 0) {
      return toast.error(
        "Montant invalide",
        "Veuillez entrer un chiffre positif.",
      );
    }

    if (montant > totalCumuleTirelires + 0.01) {
      return toast.warning(
        "Solde insuffisant",
        `L'épargne totale ne contient que ${formatCurrency(totalCumuleTirelires)}.`,
      );
    }

    try {
      const result = await breakCascade(user.id, montant);
      if (result.recupere < 0.01) {
        toast.warning(
          "Aucun montant récupéré",
          "Aucun montant n'a été récupéré car les cagnottes sont verrouillées.",
        );
      } else {
        if (result.manquant > 0.01) {
          toast.warning(
            "Retrait partiel",
            `Seul ${formatCurrency(result.recupere)} a été récupéré. Le reste (${formatCurrency(result.manquant)}) est protégé par des cagnottes verrouillées.`,
          );
        } else {
          toast.success(
            "Argent récupéré !",
            `${formatCurrency(montant)} ont été ajoutés à vos revenus.`,
          );
        }
      }

      await loadData();

      setIsBreakModalVisible(false);
      setMontantSaisi("");
      refresh();
    } catch (e) {
      toast.error("Erreur", "Impossible de casser la tirelire.");
    }
  };

  const openBreakModal = () => {
    setMontantSaisi("");
    setCagnottesOfTirelireToBreak([]);
    setIsChooseTirelireToBreak(false);
    setIsBreakModalVisible(true);
  };

  if (loading && tirelires.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const handleDragEnd = async ({ data }: { data: ITirelire[] }) => {
    const newPositions = data.map((item, index) => ({
      id: item.id,
      position: index + 1,
    }));

    try {
      await updateSubTireliresOrder(newPositions);
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("error", "Erreur lors du changement d'ordre");
      refresh();
    }
  };

  const renderTirelire = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<ITirelire>) => {
    const progression = Math.min(
      (item.montantActuel / item.objectif) * 100,
      100,
    );

    return (
      <ScaleDecorator>
        <Pressable
          onPress={() => navigation.navigate("Tirelire", { tirelire: item })}
          style={[
            styles.tirelireCard,
            { marginHorizontal: 20 },
            isActive && { backgroundColor: "#f1f3f5", elevation: 4 },
            item.isLocked && {
              borderStyle: "dashed",
              borderColor: "#9b59b6",
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.tirelireHeader}>
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={100}
              style={{ paddingRight: 10, paddingVertical: 5 }}
            >
              <GripVertical size={20} color="#bdc3c7" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <View
                  style={[styles.priorityBadge, styles.priorityBadgeNormal]}
                >
                  <Text style={styles.priorityText}>
                    {(getIndex() ?? 0) + 1}
                  </Text>
                </View>
                <Text style={styles.subTitle}>{item.description}</Text>
              </View>
              <Text style={styles.tirelireAmount}>
                {formatCurrency(item.montantActuel)}{" "}
                <Text style={styles.objectivSmall}>
                  / {formatCurrency(item.objectif)}
                </Text>
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  setEditingTirelire(item);
                  setNewTirelire({
                    nom: item.description,
                    objectif: item.objectif.toString(),
                    montantInitial: item.montantInitial.toString(),
                  });
                  setIsAddModalVisible(true);
                }}
              >
                <Pencil size={18} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setTirelireToDelete(item.id);
                  setIsDeleteModalVisible(true);
                }}
              >
                <Trash2 size={18} color="#e74c3c" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleUpdateIsLocked(item.id, !item.isLocked);
                }}
              >
                {item.isLocked ? (
                  <Lock size={18} color="#9b59b6" />
                ) : (
                  <Unlock size={18} color="#9b59b6" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progression}%` }]} />
          </View>

          <Text style={styles.remainingText}>
            {item.montantActuel >= item.objectif
              ? "Objectif atteint ! 🎉"
              : `Il manque ${formatCurrency(item.objectif - item.montantActuel)}`}
          </Text>
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <DraggableFlatList
        data={tirelires}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderTirelire}
        activationDistance={10}
        autoscrollThreshold={50}
        dragItemOverflow={true}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        simultaneousHandlers={[]}
        ListHeaderComponent={
          <>
            <View style={styles.monthSelector}>
              <TouchableOpacity
                style={[
                  styles.monthArrow,
                  selectedDate.format("YYYY-MM") === "2026-01" && {
                    opacity: 0.3,
                  },
                ]}
                onPress={() => {
                  const prevMonth = selectedDate.subtract(1, "month");
                  if (prevMonth.isAfter(dayjs("2025-12-31"), "day")) {
                    setSelectedDate(prevMonth);
                  }
                }}
                disabled={selectedDate.format("YYYY-MM") === "2026-01"}
              >
                <ChevronLeft size={24} color="#2c3e50" />
              </TouchableOpacity>

              <View style={{ alignItems: "center" }}>
                <Text style={styles.monthLabel}>
                  {selectedDate.format("MMMM YYYY")}
                </Text>
                {isCurrentMonth && (
                  <View style={styles.currentMonthBadge}>
                    <View style={styles.dot} />
                    <Text style={styles.currentMonthText}>Mois en cours</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.monthArrow,
                  isLatestPossibleMonth && { opacity: 0.3 },
                ]}
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
                {loading ? "..." : `${formatCurrency(epargneDisponible)}`}
              </Text>

              {isCurrentMonth && (
                <View style={styles.infoBox}>
                  <AlertCircle size={16} color="#f39c12" />
                  <Text style={styles.infoText}>
                    Le mois n'est pas fini. Ce montant peut varier selon vos
                    dépenses à venir.
                  </Text>
                </View>
              )}

              <View style={styles.miniStatsRow}>
                <View>
                  <Text style={styles.miniStatLabel}>Total Revenus</Text>
                  <Text style={styles.miniStatValue}>
                    {formatCurrency(statsMois.revenus)}
                    {statsMois.retraits > 0 && (
                      <Text style={{ fontSize: 10 }}>
                        {" "}
                        (+{formatCurrency(statsMois.retraits)} épargne)
                      </Text>
                    )}
                  </Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                  <Text style={styles.miniStatLabel}>Total Dépenses</Text>
                  <Text style={styles.miniStatValue}>
                    {formatCurrency(statsMois.depenses)}
                  </Text>
                </View>
              </View>
            </View>

            {(!isPositive || !isMonthFinished) && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  {!isMonthFinished
                    ? "Attendez la fin du mois pour placer votre épargne."
                    : "Solde insuffisant pour épargner ce mois-ci."}
                </Text>
              </View>
            )}
            <>
              <View style={styles.sectionHeader}>
                <TouchableOpacity
                  style={[
                    styles.dispatchButton,
                    epargneDisponible <= 0.0 && { opacity: 0.3 },
                    { borderColor: "#27ae60", borderWidth: 1 },
                  ]}
                  onPress={() =>
                    epargneDisponible > 0.0 && setIsDispatchModalVisible(true)
                  }
                  disabled={epargneDisponible <= 0.0}
                >
                  <HandCoins size={24} color="#27ae60" />
                  <Text
                    style={[styles.dispatchButtonText, { color: "#27ae60" }]}
                  >
                    Placer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dispatchButton,
                    { borderColor: "#e67e22", borderWidth: 1 },
                    totalCumuleTirelires < 0.01 && { opacity: 0.3 },
                  ]}
                  onPress={() => openBreakModal()}
                  disabled={totalCumuleTirelires < 0.01}
                >
                  <Hammer size={24} color="#e67e22" />
                  <Text
                    style={[styles.dispatchButtonText, { color: "#e67e22" }]}
                  >
                    Casser
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dispatchButton,
                    { borderColor: "#3498db", borderWidth: 1 },
                  ]}
                  onPress={() => setIsAddModalVisible(true)}
                >
                  <PlusCircle size={24} color="#3498db" />
                  <Text
                    style={[styles.dispatchButtonText, { color: "#3498db" }]}
                  >
                    Ajouter
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <View style={styles.titleWithIcon}>
                  <PiggyBank size={22} color="#2c3e50" />
                  <Text style={styles.sectionTitle}>Mes tirelires</Text>
                </View>
              </View>

              <View style={styles.totalAccumulatedContainer}>
                <View>
                  <Text style={styles.totalAccumulatedLabel}>
                    Épargne Totale Accumulée
                  </Text>
                  <Text style={styles.totalAccumulatedAmount}>
                    {formatCurrency(totalCumuleTirelires)}
                  </Text>
                </View>
                <View style={styles.totalAccumulatedIcon}>
                  <Briefcase size={24} color="#3498db" />
                </View>
              </View>
            </>
          </>
        }
      />

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
              Disponible ce mois : {formatCurrency(epargneDisponible)}
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
                    Reste {formatCurrency(t.objectif - t.montantActuel)}
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
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Retirer de l'argent</Text>
            <Text style={styles.inputLabel}>Montant à retirer (€)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="ex: 100"
              value={montantSaisi}
              onChangeText={setMontantSaisi}
            />

            <View style={styles.breakInfoBox}>
              <Text style={styles.breakInfoText}>
                Ce montant sera retiré de la tirelire et ajouté à vos revenus de
                ce mois afin de couvrir votre dépense réelle.
              </Text>
            </View>

            {!isChooseTirelireToBreak ? (
              <>
                <Text style={styles.inputLabel}>De quelle tirelire ?</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  <TouchableOpacity
                    style={[styles.dispatchItem, styles.dispatchItemAuto]}
                    onPress={async () => {
                      handleConfirmBreakLessImportant();
                    }}
                  >
                    <View style={styles.dispatchItemAutoContent}>
                      <View style={styles.dispatchItemAutoText}>
                        <Text
                          style={[
                            styles.dispatchItemName,
                            styles.dispatchItemAutoName,
                          ]}
                        >
                          Retrait Automatique
                        </Text>
                        <Text style={styles.dispatchItemReste}>
                          Piochera dans vos tirelires selon leur priorité.
                        </Text>
                      </View>
                      <Zap
                        size={24}
                        color="#e67e22"
                        style={styles.dispatchItemAutoIcon}
                      />
                    </View>
                  </TouchableOpacity>
                  {tirelires.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={styles.dispatchItem}
                      onPress={async () => {
                        const cagnottes = await getCagnottes(t.id);
                        if (cagnottes.length > 0) {
                          setIsChooseTirelireToBreak(true);
                          setCagnottesOfTirelireToBreak(
                            await getCagnottes(t.id),
                          );
                        } else {
                          handleConfirmBreak(t);
                        }
                      }}
                    >
                      <Text style={styles.dispatchItemName}>
                        {t.description}
                      </Text>
                      <Text style={styles.dispatchItemReste}>
                        Contient {formatCurrency(t.montantActuel)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>De quelle cagnotte ?</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {cagnottesOfTirelireToBreak.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.dispatchItem}
                      onPress={() => handleConfirmBreak(c)}
                    >
                      <Text style={styles.dispatchItemName}>
                        {c.description}
                      </Text>
                      <Text style={styles.dispatchItemReste}>
                        Contient {formatCurrency(c.montantActuel)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={[styles.btnCancel, { marginTop: 15 }]}
              onPress={() => {
                setIsBreakModalVisible(false);
                setIsChooseTirelireToBreak(false);
                setCagnottesOfTirelireToBreak([]);
              }}
            >
              <Text style={styles.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
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
    </GestureHandlerRootView>
  );
};

export default EpargneScreen;

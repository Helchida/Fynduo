import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { ITirelire, RootStackRouteProp } from "@/types";
import { useAuth } from "hooks/useAuth";
import { useToast } from "hooks/useToast";
import {
  PlusCircle,
  Coins,
  PackageOpen,
  Trash2,
  Archive,
  Target,
  GripVertical,
  Zap,
  Pencil,
  Lock,
  Unlock,
} from "lucide-react-native";
import {
  addSubTirelire,
  affecterMontantSub,
  breakSingleTirelireCagnottesOnly,
  breakSubTirelire,
  deleteSubTirelire,
  updateSubTireliresOrder,
  updateTirelire,
} from "services/supabase/db";
import { useSubTirelires } from "hooks/useSubTirelires";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { styles } from "../../../styles/screens/EpargneScreen/TirelireScreen/TirelireScreen.style";
import { common } from "../../../styles/common.style";
import { spacing } from "../../../styles/theme.style";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";

type TirelireRouteProp = RootStackRouteProp<"Tirelire">;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const ProgressBar = ({
  progress,
  color = "#3498db",
}: {
  progress: number;
  color?: string;
}) => (
  <View style={styles.progressBarBg}>
    <View
      style={[
        styles.progressBarFill,
        { width: `${Math.min(progress, 100)}%`, backgroundColor: color },
      ]}
    />
  </View>
);

const TirelireScreen: React.FC = () => {
  const route = useRoute<TirelireRouteProp>();
  const { tirelire } = route.params;
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const { showToast } = useToast();
  const { subTirelires, loading, refresh, updateLocalSubTirelire } =
    useSubTirelires(tirelire.id);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isBreakModalVisible, setIsBreakModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [subToAction, setSubToAction] = useState<ITirelire | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [amountToStore, setAmountToStore] = useState("");
  const [montantSaisi, setMontantSaisi] = useState("");
  const [editingCagnotte, setEditingCagnotte] = useState<ITirelire | null>(
    null,
  );

  const montantTotalReel = tirelire.montantActuel;
  const objectifGlobal = tirelire.objectif;
  const progressionGlobale =
    objectifGlobal > 0 ? (montantTotalReel / objectifGlobal) * 100 : 0;

  const montantRangé = useMemo(
    () => subTirelires.reduce((acc, sub) => acc + (sub.montantInitial || 0), 0),
    [subTirelires],
  );

  const montantEnVrac = montantTotalReel - montantRangé;

  const totalObjectifsSub = useMemo(
    () => subTirelires.reduce((acc, sub) => acc + (sub.objectif || 0), 0),
    [subTirelires],
  );

  const resteAAllouer = objectifGlobal - totalObjectifsSub;

  const handleCreateSub = async () => {
    const goalValue = parseFloat(newGoal.replace(",", ".")) || 0;

    if (!newTitle || !user) return;

    if (goalValue > resteAAllouer + 0.01) {
      showToast(
        "warning",
        `L'objectif dépasse la capacité globale (Max: ${formatCurrency(resteAAllouer)})`,
      );
      return;
    }

    try {
      await addSubTirelire(user.id, tirelire.id, newTitle, goalValue);
      setIsAddModalVisible(false);
      setNewTitle("");
      setNewGoal("");
      refresh();
      showToast("success", "Nouveau rangement créé");
    } catch (error) {
      showToast("error", "Erreur lors de la création");
    }
  };

  const handleConfirmStorageWithTarget = async (targetSub: ITirelire) => {
    const val = parseFloat(amountToStore.replace(",", "."));

    if (isNaN(val) || val <= 0) {
      showToast("warning", "Veuillez saisir un montant valide");
      return;
    }

    const montantActuelCagnotte = targetSub.montantInitial || 0;
    const objectifCagnotte = targetSub.objectif || 0;
    const resteARemplirCagnotte = objectifCagnotte - montantActuelCagnotte;

    if (val > resteARemplirCagnotte + 0.01) {
      showToast(
        "warning",
        "Objectif dépassé",
        `Cette cagnotte ne peut plus recevoir que ${formatCurrency(resteARemplirCagnotte)}.`,
      );
      return;
    }

    if (val > montantEnVrac + 0.01) {
      showToast("warning", "Montant en vrac insuffisant");
      return;
    }

    try {
      await affecterMontantSub(targetSub.id, val);
      setIsTransferModalVisible(false);
      setAmountToStore("");
      refresh();
      showToast("success", `Argent rangé dans ${targetSub.description}`);
    } catch (error) {
      showToast("error", "Erreur de rangement");
    }
  };

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
      showToast("error", "Erreur lors du changement d'ordre");
      refresh();
    }
  };

  const openBreakModal = () => {
    setMontantSaisi("");
    setIsBreakModalVisible(true);
  };

  const handleConfirmBreak = async (cagnotteToBreak: ITirelire) => {
    const montant = parseFloat(montantSaisi.replace(",", "."));

    if (isNaN(montant) || montant <= 0) {
      return showToast(
        "error",
        "Montant invalide",
        "Veuillez entrer un chiffre positif.",
      );
    }

    if (montant > cagnotteToBreak.montantInitial + 0.01) {
      return showToast(
        "warning",
        "Solde insuffisant",
        `Cette tirelire ne contient que ${formatCurrency(cagnotteToBreak.montantInitial)}.`,
      );
    }

    try {
      await breakSubTirelire(cagnotteToBreak.id, montant);

      showToast(
        "success",
        "Argent récupéré !",
        `${formatCurrency(montant)} ont été ajoutés à votre argent non réparti.`,
      );

      setIsBreakModalVisible(false);
      setMontantSaisi("");
      refresh();
    } catch (e) {
      showToast("error", "Erreur", "Impossible de casser la cagnotte.");
    }
  };

  const handleConfirmBreakLessImportant = async (tirelireParent: ITirelire) => {
    const montant = parseFloat(montantSaisi.replace(",", "."));

    if (isNaN(montant) || montant <= 0) {
      return showToast(
        "error",
        "Montant invalide",
        "Veuillez entrer un chiffre positif.",
      );
    }

    if (montant > montantTotalReel + 0.01) {
      return showToast(
        "warning",
        "Solde insuffisant",
        `L'épargne totale ne contient que ${formatCurrency(montantTotalReel)}.`,
      );
    }

    try {
      const result = await breakSingleTirelireCagnottesOnly(
        user.id,
        tirelireParent,
        montant,
      );

      if(result.recupere < 0.01) {
        showToast(
          "warning",
          "Aucun montant récupéré",
          "Aucun montant n'a été récupéré car les cagnottes sont verrouillées."
        );

      }else{
        if (result.manquant > 0.01) {
        showToast(
          "warning",
          "Retrait partiel",
          `Seul ${formatCurrency(result.recupere)} a été récupéré. Le reste (${formatCurrency(result.manquant)}) est protégé par des cagnottes verrouillées.`,
        );
      } else {
        showToast(
          "success",
          "Argent récupéré !",
          `${formatCurrency(montant)} ont été ajoutés à votre argent non réparti.`,
        );
      }
      }

      
      setIsBreakModalVisible(false);
      setMontantSaisi("");
      refresh();
    } catch (e) {
      showToast("error", "Erreur", "Impossible de casser la cagnotte.");
    }
  };

  const handleUpdateCagnotte = async () => {
    if (!editingCagnotte) return;

    try {
      const budget = parseFloat(newGoal.replace(",", "."));

      if (isNaN(budget)) {
        return showToast(
          "error",
          "Format invalide",
          "Veuillez entrer des nombres valides.",
        );
      }

      const totalAutresObjectifs = subTirelires
        .filter((sub) => sub.id !== editingCagnotte.id)
        .reduce((acc, sub) => acc + (sub.objectif || 0), 0);

      const capaciteMax = objectifGlobal - totalAutresObjectifs;

      if (budget > capaciteMax) {
        return showToast(
          "warning",
          "Objectif invalide",
          `L'objectif ne peut pas dépasser ${formatCurrency(capaciteMax)}.`,
        );
      }

      await updateTirelire(editingCagnotte.id, {
        description: newTitle,
        objectif: budget,
      });

      showToast("success", "Mis à jour", "Tirelire modifiée avec succès.");

      setIsAddModalVisible(false);
      setEditingCagnotte(null);
      setNewTitle("");
      setNewGoal("");

      refresh();
    } catch (e) {
      showToast("error", "Erreur", "Impossible de modifier la tirelire.");
    }
  };

  const handleUpdateIsLocked = async (
    cagnotteId: string,
    isLocked: boolean,
  ) => {
    updateLocalSubTirelire(cagnotteId, { isLocked: isLocked });

    try {
      await updateTirelire(cagnotteId, { is_locked: isLocked });
    } catch (e) {
      updateLocalSubTirelire(cagnotteId, { isLocked: !isLocked });
      showToast(
        "error",
        "Erreur",
        "Impossible de mettre à jour le verrouillage.",
      );
    }
  };

  const renderSubTirelire = ({
    item: sub,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<ITirelire>) => {
    const index = getIndex() ?? 0;
    const subObj = sub.objectif || 0;
    const subRangé = sub.montantInitial || 0;
    const subProg = subObj > 0 ? (subRangé / subObj) * 100 : 0;

    return (
      <ScaleDecorator activeScale={1.05}>
        <View
          style={[
            styles.subCard,
            { marginHorizontal: 20 },
            isActive && {
              backgroundColor: "#f8f9fa",
              elevation: 8,
              shadowOpacity: 0.3,
              transform: [{ scale: 1.02 }],
            },
            sub.isLocked && {
              borderStyle: "dashed",
              borderColor: "#9b59b6",
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.subCardHeader}>
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={100}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={{
                paddingVertical: 10,
                paddingRight: 15,
                justifyContent: "center",
              }}
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
                  style={[common.priorityBadge, common.priorityBadgeNormal]}
                >
                  <Text style={common.priorityText}>{index + 1}</Text>
                </View>
                <Text style={common.subTitle}>{sub.description}</Text>
              </View>

              <View style={styles.subAmountRow}>
                <Text style={styles.subAmountRange}>
                  {formatCurrency(subRangé)}
                </Text>
                {subObj > 0 && (
                  <Text style={styles.subAmountGoal}>
                    {" "}
                    / {formatCurrency(subObj)}
                  </Text>
                )}
              </View>
            </View>

            <View style={common.subActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditingCagnotte(sub);
                  setNewTitle(sub.description);
                  setNewGoal(sub.objectif.toString());
                  setIsAddModalVisible(true);
                }}
              >
                <Pencil size={18} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSubToAction(sub);
                  setIsDeleteModalVisible(true);
                }}
              >
                <Trash2 size={18} color="#e74c3c" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleUpdateIsLocked(sub.id, !sub.isLocked);
                }}
              >
                {sub.isLocked ? (
                  <Lock size={18} color="#9b59b6" />
                ) : (
                  <Unlock size={18} color="#9b59b6" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {subObj > 0 && <ProgressBar progress={subProg} color={"#3498db"} />}
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <DraggableFlatList
        data={subTirelires}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderSubTirelire}
        activationDistance={10}
        autoscrollThreshold={50}
        dragItemOverflow={true}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        simultaneousHandlers={[]}
        ListHeaderComponent={
          <>
            <View style={[styles.mainCard, { marginTop: 20 }]}>
              <View style={styles.amountContainer}>
                <Text style={styles.label}>
                  Tirelire {tirelire.description}
                </Text>
                <Text style={styles.infoText}>Total tirelire :</Text>
                <Text style={styles.mainAmount}>
                  {formatCurrency(montantTotalReel)}
                  <Text style={styles.goalSmall}>
                    {" "}
                    / {formatCurrency(objectifGlobal)}
                  </Text>
                </Text>
              </View>
              <ProgressBar progress={progressionGlobale} color="#2ecc71" />
              <Text style={styles.infoText}>
                {progressionGlobale >= 100
                  ? "Objectif atteint !"
                  : `${formatCurrency(objectifGlobal - montantTotalReel)} restant pour atteindre l'objectif`}
              </Text>
              <View style={styles.divider} />
              <View style={styles.vracRow}>
                <Coins size={24} color="#27ae60" />
                <Text style={styles.vracText}>
                  Non réparti :{" "}
                  <Text style={styles.vracAmount}>
                    {formatCurrency(montantEnVrac)}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={common.sectionHeader}>
              <TouchableOpacity
                style={[
                  common.dispatchButton,
                  { borderColor: "#27ae60", borderWidth: 1 },
                  (montantEnVrac < 0.01 || subTirelires.length === 0) && { opacity: 0.3 },
                ]}
                onPress={() => setIsTransferModalVisible(true)}
                disabled={montantEnVrac < 0.01 || subTirelires.length === 0}
              >
                <Archive size={24} color="#27ae60" />
                <Text style={[common.dispatchButtonText, { color: "#27ae60" }]}>
                  Répartir
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  common.dispatchButton,
                  { borderColor: "#e67e22", borderWidth: 1 },
                  montantRangé < 0.01 && { opacity: 0.3 },
                ]}
                onPress={() => openBreakModal()}
                disabled={montantRangé < 0.01}
              >
                <PackageOpen size={24} color="#e67e22" />
                <Text style={[common.dispatchButtonText, { color: "#e67e22" }]}>
                  Libérer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  common.dispatchButton,
                  { borderColor: "#3498db", borderWidth: 1 },
                ]}
                onPress={() => setIsAddModalVisible(true)}
              >
                <PlusCircle size={24} color="#3498db" />
                <Text style={[common.dispatchButtonText, { color: "#3498db" }]}>
                  Ajouter
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.sectionContainer]}>
              <View style={common.titleWithIcon}>
                <Target style={{ marginBottom: spacing.md }} size={22} color="#2c3e50" />
                <Text style={common.sectionTitle}>Mes cagnottes</Text>
              </View>
              {loading && (
                <ActivityIndicator color="#3498db" style={{ marginTop: 20 }} />
              )}
            </View>
          </>
        }
      />

      <Modal
        visible={isTransferModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={common.modalOverlay}>
          <View style={common.modalContent}>
            <Text style={common.modalTitle}>Répartir l'argent</Text>
            <Text
              style={{
                textAlign: "center",
                marginBottom: 20,
                color: "#7f8c8d",
              }}
            >
              Non réparti : {formatCurrency(montantEnVrac)}
            </Text>

            <Text style={common.inputLabel}>Montant à répartir (€)</Text>
            <TextInput
              style={common.input}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="ex: 100"
              value={amountToStore}
              onChangeText={setAmountToStore}
            />

            <Text style={common.inputLabel}>Vers quelle cagnotte ?</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {subTirelires.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={common.dispatchItem}
                  onPress={() => handleConfirmStorageWithTarget(sub)}
                >
                  <Text style={common.dispatchItemName}>{sub.description}</Text>
                  <Text style={common.dispatchItemReste}>
                    Reste{" "}
                    {formatCurrency(
                      (sub.objectif || 0) - (sub.montantInitial || 0),
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[common.modalCloseButton, { marginTop: 15 }]}
              onPress={() => {
                setIsTransferModalVisible(false);
                setAmountToStore("");
              }}
            >
              <Text style={common.modalCloseButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={common.modalOverlay}>
          <View style={common.modalContent}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {editingCagnotte ? (
                <Pencil size={22} color="#3498db" />
              ) : (
                <Target size={22} color="#2c3e50" />
              )}
              <Text style={common.modalTitle}>
                {editingCagnotte ? "Modifier la cagnotte" : "Nouvelle cagnotte"}
              </Text>
            </View>
            <Text style={common.inputLabel}>Nom de la cagnotte</Text>
            <TextInput
              style={common.input}
              placeholder="ex: Essence, Jean..."
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <Text style={common.inputLabel}>Objectif (€)</Text>
            <TextInput
              style={common.input}
              placeholder="ex: 200"
              keyboardType="decimal-pad"
              value={newGoal}
              onChangeText={setNewGoal}
            />
            <View style={common.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setIsAddModalVisible(false);
                  setEditingCagnotte(null);
                  setNewTitle("");
                  setNewGoal("");
                }}
                style={common.btnCancel}
              >
                <Text style={common.btnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={
                  editingCagnotte ? handleUpdateCagnotte : handleCreateSub
                }
                style={common.btnConfirm}
              >
                <Text style={common.btnConfirmText}>
                  {editingCagnotte ? "Modifier" : "Créer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isBreakModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={common.modalOverlay}>
          <View style={common.modalContent}>
            <Text style={common.modalTitle}>Vider une cagnotte</Text>
            <Text style={common.inputLabel}>Montant à retirer (€)</Text>
            <TextInput
              style={common.input}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="ex: 100"
              value={montantSaisi}
              onChangeText={setMontantSaisi}
            />

            <View style={common.breakInfoBox}>
              <Text style={common.breakInfoText}>
                Ce montant sera retiré de la cagnotte et ajouté à l'argent non
                réparti.
              </Text>
            </View>

            <>
              <Text style={common.inputLabel}>De quelle cagnotte ?</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                <TouchableOpacity
                  style={[common.dispatchItem, common.dispatchItemAuto]}
                  onPress={async () => {
                    handleConfirmBreakLessImportant(tirelire);
                  }}
                >
                  <View style={common.dispatchItemAutoContent}>
                    <View style={common.dispatchItemAutoText}>
                      <Text
                        style={[
                          common.dispatchItemName,
                          common.dispatchItemAutoName,
                        ]}
                      >
                        Retrait Automatique
                      </Text>
                      <Text style={common.dispatchItemReste}>
                        Piochera dans vos cagnottes selon leur priorité.
                      </Text>
                    </View>
                    <Zap
                      size={24}
                      color="#e67e22"
                      style={common.dispatchItemAutoIcon}
                    />
                  </View>
                </TouchableOpacity>
                {subTirelires.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={common.dispatchItem}
                    onPress={async () => {
                      handleConfirmBreak(t);
                    }}
                  >
                    <Text style={common.dispatchItemName}>{t.description}</Text>
                    <Text style={common.dispatchItemReste}>
                      Contient {formatCurrency(t.montantInitial)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>

            <TouchableOpacity
              style={[common.modalCloseButton, { marginTop: 15 }]}
              onPress={() => {
                setIsBreakModalVisible(false);
              }}
            >
              <Text style={common.modalCloseButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={isDeleteModalVisible}
        title="Supprimer"
        message={`Supprimer "${subToAction?.description}" ?`}
        confirmText="Supprimer"
        isDestructive={true}
        onConfirm={async () => {
          if (subToAction) await deleteSubTirelire(subToAction.id);
          refresh();
          setIsDeleteModalVisible(false);
          showToast("success", "Supprimé");
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </GestureHandlerRootView>
  );
};

export default TirelireScreen;

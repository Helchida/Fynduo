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
  Hammer,
  Trash2,
  Archive,
  Target,
  GripVertical,
  Zap,
} from "lucide-react-native";
import {
  addSubTirelire,
  affecterMontantSub,
  breakSingleTirelireCagnottesOnly,
  breakSubTirelire,
  deleteSubTirelire,
  updateSubTireliresOrder,
} from "services/supabase/db";
import { useSubTirelires } from "hooks/useSubTirelires";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { styles } from "./TirelireScreen.style";
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
  const { subTirelires, loading, refresh } = useSubTirelires(tirelire.id);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isBreakModalVisible, setIsBreakModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [subToAction, setSubToAction] = useState<ITirelire | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [amountToStore, setAmountToStore] = useState("");
  const [montantSaisi, setMontantSaisi] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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

    setActionLoading(true);
    try {
      await addSubTirelire(user.id, tirelire.id, newTitle, goalValue);
      setIsAddModalVisible(false);
      setNewTitle("");
      setNewGoal("");
      refresh();
      showToast("success", "Nouveau rangement créé");
    } catch (error) {
      showToast("error", "Erreur lors de la création");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmStorageWithTarget = async (targetSub: ITirelire) => {
    const val = parseFloat(amountToStore.replace(",", "."));

    if (isNaN(val) || val <= 0) {
      showToast("warning", "Veuillez saisir un montant valide");
      return;
    }

    if (val > montantEnVrac + 0.01) {
      showToast("warning", "Montant en vrac insuffisant");
      return;
    }

    setActionLoading(true);
    try {
      await affecterMontantSub(targetSub.id, val);
      setIsTransferModalVisible(false);
      setAmountToStore("");
      refresh();
      showToast("success", `Argent rangé dans ${targetSub.description}`);
    } catch (error) {
      showToast("error", "Erreur de rangement");
    } finally {
      setActionLoading(false);
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
      await breakSingleTirelireCagnottesOnly(user.id, tirelireParent, montant);

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
                  style={[styles.priorityBadge, styles.priorityBadgeNormal]}
                >
                  <Text style={styles.priorityText}>{index + 1}</Text>
                </View>
                <Text style={styles.subTitle}>{sub.description}</Text>
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

            <View style={styles.subActions}>
              <TouchableOpacity
                onPress={() => {
                  setSubToAction(sub);
                  setIsDeleteModalVisible(true);
                }}
                style={styles.actionIcon}
              >
                <Trash2 size={18} color="#e74c3c" />
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
                <Coins size={24} color="#3498db" />
                <Text style={styles.vracText}>
                  Non réparti :{" "}
                  <Text style={styles.vracAmount}>
                    {formatCurrency(montantEnVrac)}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <TouchableOpacity
                style={[
                  styles.dispatchButton,
                  { borderColor: "#27ae60", borderWidth: 1 },
                ]}
                onPress={() => setIsTransferModalVisible(true)}
              >
                <Archive size={20} color="#27ae60" />
                <Text style={[styles.dispatchButtonText, { color: "#27ae60" }]}>
                  Répartir
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dispatchButton,
                  { borderColor: "#e67e22", borderWidth: 1 },
                ]}
                onPress={() => openBreakModal()}
              >
                <Hammer size={24} color="#e67e22" />
                <Text style={[styles.dispatchButtonText, { color: "#e67e22" }]}>
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
                <PlusCircle size={20} color="#3498db" />
                <Text style={[styles.dispatchButtonText, { color: "#3498db" }]}>
                  Ajouter
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.sectionContainer]}>
              <View style={styles.titleWithIcon}>
                <Target size={22} color="#2c3e50" />
                <Text style={styles.sectionTitle}>Mes cagnottes</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Répartir l'argent</Text>
            <Text
              style={{
                textAlign: "center",
                marginBottom: 20,
                color: "#7f8c8d",
              }}
            >
              Non réparti : {formatCurrency(montantEnVrac)}
            </Text>

            <Text style={styles.inputLabel}>Montant à répartir (€)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="ex: 100"
              value={amountToStore}
              onChangeText={setAmountToStore}
            />

            <Text style={styles.inputLabel}>Vers quelle cagnotte ?</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {subTirelires.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={styles.dispatchItem}
                  onPress={() => handleConfirmStorageWithTarget(sub)}
                >
                  <Text style={styles.dispatchItemName}>{sub.description}</Text>
                  <Text style={styles.dispatchItemReste}>
                    Reste{" "}
                    {formatCurrency(
                      (sub.objectif || 0) - (sub.montantInitial || 0),
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.btnCancel, { marginTop: 15 }]}
              onPress={() => {
                setIsTransferModalVisible(false);
                setAmountToStore("");
              }}
            >
              <Text style={styles.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isAddModalVisible} transparent animationType="slide">
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
              <Target size={22} color="#2c3e50" />
              <Text style={styles.modalTitle}>Nouvelle cagnotte</Text>
            </View>
            <Text style={styles.inputLabel}>Nom de la cagnotte</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Essence, Jean..."
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <Text style={styles.inputLabel}>Objectif (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 200"
              keyboardType="decimal-pad"
              value={newGoal}
              onChangeText={setNewGoal}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateSub}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>Créer</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Vider une cagnotte</Text>
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
                Ce montant sera retiré de la cagnotte et ajouté à l'argent non
                réparti.
              </Text>
            </View>

            <>
              <Text style={styles.inputLabel}>De quelle cagnotte ?</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                <TouchableOpacity
                  style={[styles.dispatchItem, styles.dispatchItemAuto]}
                  onPress={async () => {
                    handleConfirmBreakLessImportant(tirelire);
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
                        Piochera dans vos cagnottes selon leur priorité.
                      </Text>
                    </View>
                    <Zap
                      size={24}
                      color="#e67e22"
                      style={styles.dispatchItemAutoIcon}
                    />
                  </View>
                </TouchableOpacity>
                {subTirelires.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.dispatchItem}
                    onPress={async () => {
                      handleConfirmBreak(t);
                    }}
                  >
                    <Text style={styles.dispatchItemName}>{t.description}</Text>
                    <Text style={styles.dispatchItemReste}>
                      Contient {formatCurrency(t.montantInitial)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>

            <TouchableOpacity
              style={[styles.btnCancel, { marginTop: 15 }]}
              onPress={() => {
                setIsBreakModalVisible(false);
              }}
            >
              <Text style={styles.btnCancelText}>Annuler</Text>
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

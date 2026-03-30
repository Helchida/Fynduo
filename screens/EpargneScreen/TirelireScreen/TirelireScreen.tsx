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
  ArrowRight,
  Target,
} from "lucide-react-native";
import {
  addSubTirelire,
  affecterMontantSub,
  breakSubTirelire,
  deleteSubTirelire,
} from "services/supabase/db";
import { useSubTirelires } from "hooks/useSubTirelires";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { styles } from "./TirelireScreen.style";

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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20 }}
      >
        <View style={styles.mainCard}>
          <View style={styles.amountContainer}>
            <Text style={styles.label}>Tirelire {tirelire.description}</Text>
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
              : `Reste ${formatCurrency(objectifGlobal - montantTotalReel)}`}
          </Text>
          <View style={styles.divider} />
          <View style={styles.vracRow}>
            <Coins size={18} color="#e67e22" />
            <Text style={styles.vracText}>
              Non réparti :{" "}
              <Text style={styles.vracAmount}>
                {formatCurrency(montantEnVrac)}
              </Text>
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <TouchableOpacity
            style={styles.placeMoneyBtn}
            onPress={() => setIsTransferModalVisible(true)}
          >
            <Text style={styles.placeMoneyBtnText}>
              Répartir les {formatCurrency(montantEnVrac)}
            </Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.titleWithIcon}>
            <Target size={22} color="#2c3e50" />
            <Text style={styles.sectionTitle}>Mes cagnottes</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#3498db" style={{ marginTop: 20 }} />
          ) : (
            <>
              {subTirelires.map((sub) => {
                const subObj = sub.objectif || 0;
                const subRangé = sub.montantInitial || 0;
                const subProg = subObj > 0 ? (subRangé / subObj) * 100 : 0;

                return (
                  <View key={sub.id} style={styles.subCard}>
                    <View style={styles.subCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subTitle}>{sub.description}</Text>
                        <View style={styles.subAmountRow}>
                          <Text style={styles.subAmountRangé}>
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
                            setIsBreakModalVisible(true);
                          }}
                          style={styles.actionIcon}
                        >
                          <Hammer size={18} color="#e67e22" />
                        </TouchableOpacity>
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
                    {subObj > 0 && (
                      <ProgressBar progress={subProg} color="#3498db" />
                    )}
                  </View>
                );
              })}

              <TouchableOpacity
                style={styles.addButtonSecondary}
                onPress={() => setIsAddModalVisible(true)}
              >
                <PlusCircle size={20} color="#3498db" />
                <Text style={styles.addButtonSecondaryText}>
                  Créer une nouvelle cagnotte
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

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

      <ConfirmModal
        visible={isBreakModalVisible}
        title="Vider le rangement"
        message={`Voulez-vous remettre tout l'argent de "${subToAction?.description}" dans l'argent non réparti ?`}
        confirmText="Vider"
        onConfirm={async () => {
          if (subToAction) await breakSubTirelire(subToAction.id);
          refresh();
          setIsBreakModalVisible(false);
          showToast("info", "Cagnotte vidée");
        }}
        onCancel={() => setIsBreakModalVisible(false)}
      />

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
    </View>
  );
};

export default TirelireScreen;

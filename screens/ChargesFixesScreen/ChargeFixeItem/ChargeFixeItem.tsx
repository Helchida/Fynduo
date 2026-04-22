import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import { styles } from "../../../styles/screens/ChargesFixesScreen/ChargeFixeItem/ChargeFixeItem.style";
import { common } from "../../../styles/common.style";
import { IChargeFixeTemplate, IUser } from "@/types";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { useToast } from "hooks/useToast";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import { ChevronsUpDown, Pencil, Trash2, User } from "lucide-react-native";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useCategories } from "hooks/useCategories";
import { CategoryPickerModal } from "screens/ChargeDetail/EditChargeForm/CategoryPickerModal/CategoryPickerModal";
import {
  PeriodiciteFormSection,
  PeriodiciteValue,
  extractPeriodiciteValue,
  validatePeriodicite,
} from "../PeriodiciteFormSection/PeriodiciteFormSection";
import { getPeriodiciteDetailLabel } from "utils/recurrence";
import { ChargeFixeItemProps } from "./ChargeFixeItem.type";


const ChargeFixeItem: React.FC<ChargeFixeItemProps> = ({
  charge,
  onUpdate,
  onDelete,
  householdUsers,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const isSoloMode = user.id === user.activeHouseholdId;

  const [isEditModalVisible,   setIsEditModalVisible]   = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editAmount,      setEditAmount]      = useState(charge.montantTotal.toString());
  const [editCategorieId, setEditCategorieId] = useState(charge.categorie);
  const [editPayeurId,    setEditPayeurId]    = useState(charge.payeur);
  const [editPeriodicite, setEditPeriodicite] = useState<PeriodiciteValue>(
    extractPeriodiciteValue(charge),
  );

  const toast = useToast();
  const { categories } = useCategories();

  const currentCategoryData = categories.find((c) => c.id === charge.categorie);
  const editCategoryData    = categories.find((c) => c.id === editCategorieId);

  const openEditModal = useCallback(() => {
    setEditAmount(charge.montantTotal.toString());
    setEditCategorieId(charge.categorie);
    setEditPayeurId(charge.payeur);
    setEditPeriodicite(extractPeriodiciteValue(charge));
    setIsEditModalVisible(true);
  }, [charge]);

  const handleSaveAll = useCallback(async () => {
  const isEcheancier = editPeriodicite.periodiciteType === "echeancier";

  let newAmount = 0;
  if (!isEcheancier) {
    newAmount = parseFloat(editAmount.replace(",", "."));
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Erreur", "Le montant doit être un nombre positif.");
      return;
    }
  }

  const periodiciteError = validatePeriodicite(editPeriodicite);
  if (periodiciteError) {
    toast.error("Erreur", periodiciteError);
    return;
  }

  setIsSaving(true);
  try {
    const updates: Partial<IChargeFixeTemplate> = {};

    if (isEcheancier) {
      if (charge.montantTotal !== 0) updates.montantTotal = 0;
    } else if (newAmount !== charge.montantTotal) {
      updates.montantTotal = newAmount;
    }

    if (editCategorieId !== charge.categorie) {
      updates.categorie = editCategorieId;
    }

    if (!isSoloMode && editPayeurId !== charge.payeur) {
      updates.payeur = editPayeurId;
    }

    const originalPeriodicite = extractPeriodiciteValue(charge);
    if (JSON.stringify(editPeriodicite) !== JSON.stringify(originalPeriodicite)) {
      updates.periodiciteType = editPeriodicite.periodiciteType;
      updates.periodiciteIntervalle = editPeriodicite.periodiciteIntervalle;
      updates.datePremierPrelevement = editPeriodicite.datePremierPrelevement;
      updates.dateFin = editPeriodicite.dateFin;
      updates.echeancier = editPeriodicite.echeancier;
      updates.jourNommeConfig = editPeriodicite.jourNommeConfig;
    }

    if (Object.keys(updates).length > 0) {
      await onUpdate(charge.id, updates);
    }

    setIsEditModalVisible(false);
  } catch {
    toast.error("Erreur", "Impossible de mettre à jour la charge");
  } finally {
    setIsSaving(false);
  }
}, [
  editAmount,
  editPeriodicite,
  editCategorieId,
  editPayeurId,
  charge,
  onUpdate,
  isSoloMode,
  toast,
]);

  return (
    <View style={styles.chargeItem}>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 22, marginRight: 10 }}>
          {currentCategoryData?.icon ?? "📦"}
        </Text>
        <Text style={[styles.chargeName, { flex: 1 }]} numberOfLines={1}>
          {charge.description}
        </Text>
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <TouchableOpacity onPress={openEditModal} hitSlop={8}>
            <Pencil size={18} color="#3498db" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsDeleteModalVisible(true)}
            hitSlop={8}
          >
            <Trash2 size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#27ae60" }}>
          {charge.montantTotal.toFixed(2)} €
        </Text>
        <Text style={{ color: "#ccc", fontSize: 16 }}>•</Text>
        <Text style={{ fontSize: 13, color: "#888", flex: 1 }} numberOfLines={1}>
          {getPeriodiciteDetailLabel(charge)} · {getDisplayNameUserInHousehold(charge.payeur, householdUsers)}
        </Text>
      </View>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={common.modalOverlay}>
          <View style={[common.modalContent, { maxHeight: "90%" }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Titre */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
                <Pencil size={20} color="#3498db" />
                <Text style={[common.modalTitle, { marginBottom: 0 }]}>
                  Modifier la charge
                </Text>
              </View>
              <Text style={{ textAlign: "center", color: "#888", fontSize: 14, marginBottom: 24 }}>
                {charge.description}
              </Text>

              {editPeriodicite.periodiciteType !== "echeancier" && (
                <>
                  <Text style={common.inputLabel}>Montant (€)</Text>
                  <TextInput
                    style={common.input}
                    value={editAmount}
                    onChangeText={(t) => setEditAmount(t.replace(",", "."))}
                    keyboardType="decimal-pad"
                    {...({ inputMode: "decimal" } as any)}
                    maxLength={9}
                    editable={!isSaving}
                    placeholder="Ex : 45.00"
                    placeholderTextColor="#95a5a6"
                  />
                </>
              )}

              <Text style={common.inputLabel}>Catégorie</Text>
              <TouchableOpacity
                style={[common.selectorButton, { marginBottom: 20 }]}
                onPress={() => setIsCategoryModalVisible(true)}
                disabled={isSaving}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 18 }}>{editCategoryData?.icon ?? "📦"}</Text>
                    <Text style={{ fontSize: 15, color: "#333" }}>
                      {editCategoryData?.label ?? editCategorieId}
                    </Text>
                  </View>
                  <ChevronsUpDown size={14} color="#8E8E93" />
                </View>
              </TouchableOpacity>

              {!isSoloMode && (
                <>
                  <Text style={common.inputLabel}>Payé par</Text>
                  <TouchableOpacity
                    style={[common.selectorButton, { marginBottom: 20 }]}
                    onPress={() => setIsPayeurModalVisible(true)}
                    disabled={isSaving}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <User size={16} color="#666" />
                        <Text style={{ fontSize: 15, color: "#333" }}>
                          {getDisplayNameUserInHousehold(editPayeurId, householdUsers)}
                        </Text>
                      </View>
                      <ChevronsUpDown size={14} color="#8E8E93" />
                    </View>
                  </TouchableOpacity>
                </>
              )}

              <PeriodiciteFormSection
                value={editPeriodicite}
                onChange={setEditPeriodicite}
                disabled={isSaving}
                montantDefault={charge.montantTotal}
              />

              <View style={common.modalButtons}>
                <TouchableOpacity
                  style={common.btnCancel}
                  onPress={() => setIsEditModalVisible(false)}
                  disabled={isSaving}
                >
                  <Text style={common.btnCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[common.btnConfirm, isSaving && { opacity: 0.6 }]}
                  onPress={handleSaveAll}
                  disabled={isSaving}
                >
                  <Text style={common.btnConfirmText}>
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CategoryPickerModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        selectedId={editCategorieId}
        categories={categories}
        onSelect={(id) => {
          setEditCategorieId(id);
          setIsCategoryModalVisible(false);
        }}
      />

      <Modal
        visible={isPayeurModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPayeurModalVisible(false)}
      >
        <View style={common.modalOverlay}>
          <View style={common.modalContent}>
            <Text style={common.modalTitle}>Sélectionner le payeur</Text>
            <FlatList
              data={householdUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    common.modalItem,
                    item.id === editPayeurId && common.modalItemSelected,
                  ]}
                  onPress={() => {
                    setEditPayeurId(item.id);
                    setIsPayeurModalVisible(false);
                  }}
                >
                  <Text style={common.modalItemText}>{item.displayName}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={common.separator} />}
            />
            <TouchableOpacity
              style={common.modalCloseButton}
              onPress={() => setIsPayeurModalVisible(false)}
            >
              <Text style={common.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={isDeleteModalVisible}
        title="Supprimer la charge"
        message={`Voulez-vous vraiment supprimer "${charge.description}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        isDestructive={true}
        onConfirm={async () => {
          setIsDeleteModalVisible(false);
          await onDelete(charge.id);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
};

export default ChargeFixeItem;
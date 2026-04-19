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
import { ChargeFixeItemProps } from "./ChargeFixeItem.type";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { useToast } from "hooks/useToast";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import { CalendarDays, ChevronsUpDown, Pencil, Trash2, User } from "lucide-react-native";
import { DayPickerModal } from "components/ui/DayPickerModal/DayPickerModal";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useCategories } from "hooks/useCategories";
import { CategoryPickerModal } from "screens/ChargeDetail/EditChargeForm/CategoryPickerModal/CategoryPickerModal";

const ChargeFixeItem: React.FC<ChargeFixeItemProps> = ({
  charge,
  onUpdate,
  onDelete,
  householdUsers,
  onUpdatePayeur,
  onUpdateDay,
  onUpdateCategorie,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const isSoloMode = user.id === user.activeHouseholdId;

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editAmount, setEditAmount] = useState(charge.montantTotal.toString());
  const [editDay, setEditDay] = useState<number>(charge.jourPrelevementMensuel);
  const [editCategorieId, setEditCategorieId] = useState(charge.categorie);
  const [editPayeurId, setEditPayeurId] = useState(charge.payeur);

  const toast = useToast();
  const { categories } = useCategories();

  const currentCategoryData = categories.find((c) => c.id === charge.categorie);
  const editCategoryData = categories.find((c) => c.id === editCategorieId);

  const openEditModal = useCallback(() => {
    setEditAmount(charge.montantTotal.toString());
    setEditDay(charge.jourPrelevementMensuel);
    setEditCategorieId(charge.categorie);
    setEditPayeurId(charge.payeur);
    setIsEditModalVisible(true);
  }, [charge]);

  const handleSaveAll = useCallback(async () => {
    const newAmount = parseFloat(editAmount.replace(",", "."));

    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Erreur", "Le montant doit être un nombre positif.");
      return;
    }

    setIsSaving(true);
    try {
      const updates: Promise<void>[] = [];

      if (newAmount !== charge.montantTotal) {
        updates.push(onUpdate(charge.id, newAmount));
      }
      if (editDay !== charge.jourPrelevementMensuel) {
        updates.push(onUpdateDay(charge.id, editDay));
      }
      if (editCategorieId !== charge.categorie) {
        updates.push(onUpdateCategorie(charge.id, editCategorieId));
      }
      if (!isSoloMode && editPayeurId !== charge.payeur) {
        const payeurUser = householdUsers.find((u) => u.id === editPayeurId);
        if (payeurUser) {
          updates.push(
            onUpdatePayeur(charge.id, payeurUser.id, payeurUser.displayName),
          );
        }
      }

      await Promise.all(updates);

      setIsEditModalVisible(false);
    } catch {
      toast.error("Erreur", "Impossible de mettre à jour la charge");
    } finally {
      setIsSaving(false);
    }
  }, [
    editAmount,
    editDay,
    editCategorieId,
    editPayeurId,
    charge,
    onUpdate,
    onUpdateDay,
    onUpdateCategorie,
    onUpdatePayeur,
    isSoloMode,
    householdUsers,
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

      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 10 }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#27ae60" }}>
          {charge.montantTotal.toFixed(2)} €
        </Text>
        <Text style={{ color: "#ccc", fontSize: 16 }}>•</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <CalendarDays size={13} color="#888" />
          <Text style={{ fontSize: 13, color: "#888" }}>
            Le {charge.jourPrelevementMensuel || "-"} par {getDisplayNameUserInHousehold(charge.payeur, householdUsers)}
          </Text>
        </View>
      </View>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={common.modalOverlay}>
          <View style={[common.modalContent, { maxHeight: "80%" }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <Pencil size={20} color="#3498db" />
                <Text style={[common.modalTitle, { marginBottom: 0 }]}>
                  Modifier la charge
                </Text>
              </View>
              <Text
                style={{
                  textAlign: "center",
                  color: "#888",
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                {charge.description}
              </Text>

              <Text style={common.inputLabel}>Montant mensuel (€)</Text>
              <TextInput
                style={common.input}
                value={editAmount}
                onChangeText={(t) => setEditAmount(t.replace(",", "."))}
                keyboardType="decimal-pad"
                {...({ inputMode: "decimal" } as any)}
                maxLength={8}
                editable={!isSaving}
                placeholder="Ex : 45.00"
                placeholderTextColor="#95a5a6"
              />

              <Text style={common.inputLabel}>Catégorie</Text>
              <TouchableOpacity
                style={[common.selectorButton, { marginBottom: 20 }]}
                onPress={() => setIsCategoryModalVisible(true)}
                disabled={isSaving}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 18 }}>
                      {editCategoryData?.icon ?? "📦"}
                    </Text>
                    <Text style={{ fontSize: 15, color: "#333" }}>
                      {editCategoryData?.label ?? editCategorieId}
                    </Text>
                  </View>
                  <ChevronsUpDown size={14} color="#8E8E93" />
                </View>
              </TouchableOpacity>

              <Text style={common.inputLabel}>Jour de prélèvement</Text>
              <TouchableOpacity
                style={[common.selectorButton, { marginBottom: 20 }]}
                onPress={() => setIsDayModalVisible(true)}
                disabled={isSaving}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <CalendarDays size={16} color="#666" />
                    <Text style={{ fontSize: 15, color: "#333" }}>
                      Le {editDay || "-"}
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
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
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

      <DayPickerModal
        isVisible={isDayModalVisible}
        onClose={() => setIsDayModalVisible(false)}
        selectedDay={editDay}
        onSelectDay={(day) => {
          setEditDay(day);
          setIsDayModalVisible(false);
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
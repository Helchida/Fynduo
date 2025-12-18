import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { XCircle, ChevronsUpDown } from "lucide-react-native";
import dayjs from "dayjs";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { PayeurPickerModal } from "./PayeurPickerModal/PayeurPickerModal";
import { BeneficiariesSelector } from "./BeneficiariesSelector/BeneficiariesSelector";
import { styles } from "./EditChargeVariableForm.style";
import { EditChargeVariableFormProps } from "./EditChargeVariableForm.type";
import { CategoryPickerModal } from "./CategoryPickerModal/CategoryPickerModal";
import { CategoryType } from "@/types";

export const EditChargeVariableForm = ({
  editDescription,
  setEditDescription,
  editMontant,
  setEditMontant,
  editPayeurUid,
  setIsPayeurModalVisible,
  isPayeurModalVisible,
  householdUsers,
  getDisplayName,
  setEditPayeurUid,
  editDate,
  showDatePicker,
  isDatePickerVisible,
  handleConfirmDate,
  hideDatePicker,
  editBeneficiairesUid,
  handleToggleEditBeneficiaire,
  currentUserId,
  isSubmitting,
  handleUpdateCharge,
  setIsEditing,
  editCategorie,
  setEditCategorie,
  setIsCategoryModalVisible,
  isCategoryModalVisible,
  categories,
}: EditChargeVariableFormProps) => {
  const currentCategory = categories.find((c) => c.id === editCategorie);
  return (
    <View style={styles.editFormContainer}>
      <View style={[styles.userCard, styles.payorCard, { marginBottom: 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.editLabel}>Titre</Text>
          <View style={styles.inputFieldContainer}>
            <TextInput
              style={styles.editInputActive}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Nom de la dépense"
            />
            {editDescription.length > 0 && (
              <TouchableOpacity onPress={() => setEditDescription("")}>
                <XCircle size={20} color="#8E8E93" fill="#E5E5EA" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.userCard, styles.payorCard, { marginBottom: 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.editLabel}>Montant Total</Text>
          <View style={styles.inputFieldContainer}>
            <TextInput
              style={[styles.editInputActive]}
              value={editMontant}
              onChangeText={setEditMontant}
              keyboardType="numeric"
              placeholder="0,00"
            />
            <Text style={[styles.cardAmount, { marginLeft: 4 }]}>€</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.editSectionCard, styles.payorCard]}
        onPress={() => setIsCategoryModalVisible(true)}
      >
        <Text style={styles.editLabel}>Catégorie</Text>
        <View style={styles.selectorContainer}>
          <Text style={styles.miniUserText}>
            {currentCategory?.icon} {currentCategory?.label}
          </Text>
          <ChevronsUpDown size={16} color="#8E8E93" />
        </View>
      </TouchableOpacity>

      <View style={styles.editRow}>
        <TouchableOpacity
          style={[
            styles.editSectionCard,
            styles.payorCard,
            { flex: 1, marginRight: 8 },
          ]}
          onPress={() => setIsPayeurModalVisible(true)}
        >
          <Text style={styles.editLabel}>Payé par</Text>
          <View style={styles.selectorContainer}>
            <Text style={styles.miniUserText} numberOfLines={1}>
              {getDisplayName(editPayeurUid || "")}
            </Text>
            <ChevronsUpDown size={16} color="#8E8E93" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.editSectionCard,
            styles.payorCard,
            { flex: 1, marginLeft: 8 },
          ]}
          onPress={showDatePicker}
        >
          <Text style={styles.editLabel}>Quand</Text>
          <View style={styles.selectorContainer}>
            <Text style={styles.miniUserText}>
              {dayjs(editDate).format("D MMM")}
            </Text>
            <ChevronsUpDown size={16} color="#8E8E93" />
          </View>
        </TouchableOpacity>
      </View>

      <CategoryPickerModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        selectedId={editCategorie}
        onSelect={(id: CategoryType) => {
          setEditCategorie(id);
          setIsCategoryModalVisible(false);
        }}
        categories={categories}
      />

      <PayeurPickerModal
        isVisible={isPayeurModalVisible}
        onClose={() => setIsPayeurModalVisible(false)}
        users={householdUsers}
        selectedUid={editPayeurUid}
        onSelect={(uid) => {
          setEditPayeurUid(uid);
          setIsPayeurModalVisible(false);
        }}
        getDisplayName={getDisplayName}
      />

      <BeneficiariesSelector
        users={householdUsers}
        selectedUids={editBeneficiairesUid}
        totalAmount={editMontant}
        onToggle={handleToggleEditBeneficiaire}
        getDisplayName={getDisplayName}
        currentUserId={currentUserId}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          (isSubmitting || editBeneficiairesUid.length === 0) && {
            opacity: 0.5,
          },
        ]}
        onPress={handleUpdateCharge}
        disabled={isSubmitting || editBeneficiairesUid.length === 0}
      >
        <Text style={styles.saveButtonText}>
          {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsEditing(false)}
        style={{ marginTop: 15, alignItems: "center" }}
      >
        <Text style={{ color: "#E74C3C", fontWeight: "600" }}>Annuler</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={editDate}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
        locale="fr_FR"
        isDarkModeEnabled={false}
        textColor="black"
        {...({ themeVariant: "light" } as any)}
      />
    </View>
  );
};

import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { XCircle, ChevronsUpDown } from "lucide-react-native";
import { PayeurPickerModal } from "./PayeurPickerModal/PayeurPickerModal";
import { BeneficiariesSelector } from "./BeneficiariesSelector/BeneficiariesSelector";
import { styles } from "../../../styles/screens/ChargeDetailScreen/EditChargeForm/EditChargeForm.style";
import { common } from "../../../styles/common.style";
import { EditChargeFormProps } from "./EditChargeForm.type";
import { CategoryPickerModal } from "./CategoryPickerModal/CategoryPickerModal";
import { CategoryType } from "@/types";
import { UniversalDatePicker } from "components/ui/UniversalDatePicker/UniversalDatePicker";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";

export const EditChargeForm = ({
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
  editDateStatistiques,
  showDateStatistiquesPicker,
  isDateStatistiquesPickerVisible,
  handleConfirmDateStatistiques,
  hideDateStatistiquesPicker,
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
}: EditChargeFormProps) => {
  const { user } = useAuth();
  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const currentCategory = categories.find((c) => c.id === editCategorie);
  const isInvalid =
    isSubmitting ||
    editBeneficiairesUid.length === 0 ||
    !editDescription.trim() ||
    isNaN(parseFloat(editMontant)) ||
    parseFloat(editMontant) <= 0;

  const isActiveHouseholdSolo = user.activeHouseholdId === user.id;
  return (
    <View style={styles.editFormContainer}>
      <View style={[common.userCard, common.payorCard, { marginBottom: 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={common.editLabel}>Titre</Text>
          <View style={common.inputFieldContainer}>
            <TextInput
              style={common.editInputActive}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Nom de la dépense"
              placeholderTextColor="#95a5a6"
              maxLength={30}
            />
            {editDescription.length > 0 && (
              <TouchableOpacity onPress={() => setEditDescription("")}>
                <XCircle size={20} color="#8E8E93" fill="#E5E5EA" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={[common.userCard, common.payorCard, { marginBottom: 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={common.editLabel}>Montant Total</Text>
          <View style={common.inputFieldContainer}>
            <TextInput
              style={[common.editInputActive]}
              value={editMontant}
              onChangeText={(text) => setEditMontant(text.replace(",", "."))}
              keyboardType="decimal-pad"
              {...({ inputMode: "decimal" } as any)}
              placeholder="0,00"
              placeholderTextColor="#95a5a6"
              maxLength={8}
            />
            <Text style={[common.cardAmount, { marginLeft: 4 }]}>€</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[common.formContainer, common.payorCard]}
        onPress={() => setIsCategoryModalVisible(true)}
      >
        <Text style={common.editLabel}>Catégorie</Text>
        <View style={styles.selectorContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>
              {currentCategory?.icon || "📦"}
            </Text>
            <Text style={styles.miniUserText}>
              {currentCategory?.label || "Choisir une catégorie"}
            </Text>
          </View>
          <ChevronsUpDown size={16} color="#8E8E93" />
        </View>
      </TouchableOpacity>

      <View style={styles.editRow}>
        {!isActiveHouseholdSolo && (
          <TouchableOpacity
            style={[
              common.formContainer,
              common.payorCard,
              { flex: 1, marginRight: 8 },
            ]}
            onPress={() => setIsPayeurModalVisible(true)}
          >
            <Text style={common.editLabel}>Payé par</Text>
            <View style={styles.selectorContainer}>
              <Text style={styles.miniUserText} numberOfLines={1}>
                {getDisplayName(editPayeurUid || "")}
              </Text>
              <ChevronsUpDown size={16} color="#8E8E93" />
            </View>
          </TouchableOpacity>
        )}

        <UniversalDatePicker
          date={editDateStatistiques}
          label="Date dépense"
          isVisible={isDateStatistiquesPickerVisible}
          onConfirm={handleConfirmDateStatistiques}
          onCancel={hideDateStatistiquesPicker}
          onOpen={showDateStatistiquesPicker}
          styles={styles}
          containerStyle={{ flex: 1, marginLeft: 0 }}
        />
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
      {!isActiveHouseholdSolo && (
        <BeneficiariesSelector
          users={householdUsers}
          selectedUids={editBeneficiairesUid}
          totalAmount={editMontant}
          onToggle={handleToggleEditBeneficiaire}
          getDisplayName={getDisplayName}
          currentUserId={currentUserId}
        />
      )}
      <TouchableOpacity
        style={[
          common.saveButton,
          isInvalid && {
            opacity: 0.5,
          },
        ]}
        onPress={handleUpdateCharge}
        disabled={isInvalid}
      >
        <Text style={common.saveButtonText}>
          {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsEditing(false)}
        style={{ marginTop: 15, alignItems: "center" }}
      >
        <Text style={{ color: "#E74C3C", fontWeight: "600" }}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );
};

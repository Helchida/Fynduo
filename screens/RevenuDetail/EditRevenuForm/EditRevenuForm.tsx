import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { XCircle, ChevronsUpDown } from "lucide-react-native";
import { styles } from "../../../styles/screens/RevenuDetail/EditRevenuForm/EditRevenuForm.style";
import { common } from "styles/common.style";
import { EditRevenuFormProps } from "./EditRevenuForm.type";
import { CategoryPickerModal } from "./CategoryPickerModal/CategoryPickerModal";
import { CategoryType } from "@/types";
import { UniversalDatePicker } from "components/ui/UniversalDatePicker/UniversalDatePicker";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";

export const EditRevenuForm = ({
  editDescription,
  setEditDescription,
  editMontant,
  setEditMontant,
  editDateReception,
  showDateReceptionPicker,
  isDateReceptionPickerVisible,
  handleConfirmDateReception,
  hideDateReceptionPicker,
  isSubmitting,
  handleUpdateRevenu,
  setIsEditing,
  editCategorie,
  setEditCategorie,
  setIsCategoryModalVisible,
  isCategoryModalVisible,
  categoriesRevenus,
}: EditRevenuFormProps) => {
  const { user } = useAuth();
  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const currentCategory = categoriesRevenus.find((c) => c.id === editCategorie);
  const isInvalid =
    isSubmitting ||
    !editDescription.trim() ||
    isNaN(parseFloat(editMontant)) ||
    parseFloat(editMontant) <= 0;

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
              placeholder="Nom du revenu"
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
              {currentCategory?.icon || "💵"}
            </Text>
            <Text style={styles.miniUserText}>
              {currentCategory?.label || "Choisir une catégorie"}
            </Text>
          </View>
          <ChevronsUpDown size={16} color="#8E8E93" />
        </View>
      </TouchableOpacity>

      <View style={styles.editRow}>
        <UniversalDatePicker
          date={editDateReception}
          label="Date de réception"
          isVisible={isDateReceptionPickerVisible}
          onConfirm={handleConfirmDateReception}
          onCancel={hideDateReceptionPicker}
          onOpen={showDateReceptionPicker}
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
        categoriesRevenus={categoriesRevenus}
      />

      <TouchableOpacity
        style={[
          common.saveButton,
          isInvalid && {
            opacity: 0.5,
          },
        ]}
        onPress={handleUpdateRevenu}
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

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { IUser } from "@/types";
import { styles } from "./ChargeFixeItem.style";
import { ChargeFixeItemProps } from "./ChargeFixeItem.type";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { useToast } from "hooks/useToast";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import { CalendarDays, User } from "lucide-react-native";
import { DayPickerModal } from "components/ui/DayPickerModal/DayPickerModal";

const ChargeFixeItem: React.FC<ChargeFixeItemProps> = ({
  charge,
  onUpdate,
  onDelete,
  householdUsers,
  onUpdatePayeur,
  onUpdateDay,
}) => {
  const [amount, setAmount] = useState(charge.montantTotal.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);

  const toast = useToast();

  const handleSave = useCallback(async () => {
    const newAmount = parseFloat(amount);

    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Erreur", "Le montant doit être un nombre positif.");
      return;
    }

    if (newAmount !== charge.montantTotal) {
      setIsSaving(true);
      try {
        await onUpdate(charge.id, newAmount);
      } catch (error) {
        toast.error("Erreur", "Impossible de mettre à jour le montant");
      } finally {
        setIsSaving(false);
      }
    }
  }, [amount, charge.montantTotal, charge.id, onUpdate]);

  const selectPayeur = useCallback(
    async (newPayeur: IUser) => {
      if (newPayeur.id !== charge.payeur) {
        setIsSaving(true);
        try {
          await onUpdatePayeur(charge.id, newPayeur.id, newPayeur.displayName);
        } catch (error) {
          toast.error("Erreur", "Échec de la mise à jour du payeur.");
        } finally {
          setIsSaving(false);
          setIsPayeurModalVisible(false);
        }
      } else {
        setIsPayeurModalVisible(false);
      }
    },
    [charge.payeur, charge.id, onUpdatePayeur],
  );

  const handleUpdateDay = useCallback(
    async (newDay: number) => {
      if (newDay !== charge.jourPrelevementMensuel) {
        setIsSaving(true);
        try {
          await onUpdateDay(charge.id, newDay);
        } catch (error) {
          toast.error("Erreur", "Impossible de modifier le jour");
        } finally {
          setIsSaving(false);
        }
      }
    },
    [charge.id, charge.jourPrelevementMensuel, onUpdateDay],
  );

  const isButtonDisabled =
    parseFloat(amount) === charge.montantTotal || isSaving;

  return (
    <View style={styles.chargeItem}>
      <View style={styles.inputRow}>
        <Text style={styles.chargeName}>{charge.description}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setIsDeleteModalVisible(true)}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          style={styles.payeurContainer}
          onPress={() => setIsPayeurModalVisible(true)}
          disabled={isSaving}
        >
          <User size={16} color="#666" style={{ marginRight: 4 }} />
          <Text style={styles.payeurLabel}>Payé par: </Text>
          <Text style={styles.payeurName}>
            {getDisplayNameUserInHousehold(charge.payeur, householdUsers)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.payeurContainer,
            { borderLeftWidth: 1, borderLeftColor: "#eee", paddingLeft: 10 },
          ]}
          onPress={() => setIsDayModalVisible(true)}
          disabled={isSaving}
        >
          <CalendarDays size={16} color="#666" style={{ marginRight: 4 }} />
          <Text style={styles.payeurLabel}>Le: </Text>
          <Text style={styles.payeurName}>
            {charge.jourPrelevementMensuel || "-"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(text.replace(",", "."))}
          keyboardType="decimal-pad"
          {...({ inputMode: "decimal" } as any)}
          maxLength={8}
          editable={!isSaving}
          style={[styles.input, { backgroundColor: "#f5f5f5", color: "#333" }]}
          placeholderTextColor="#95a5a6"
        />
        <Text style={styles.currency}>€</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, isButtonDisabled && styles.disabledButton]}
          disabled={isButtonDisabled}
        >
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isPayeurModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPayeurModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              Sélectionner le nouveau payeur
            </Text>
            <FlatList
              data={householdUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.id === charge.payeur && styles.modalItemSelected,
                  ]}
                  onPress={() => selectPayeur(item)}
                >
                  <Text style={styles.modalItemText}>{item.displayName}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsPayeurModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DayPickerModal
        isVisible={isDayModalVisible}
        onClose={() => setIsDayModalVisible(false)}
        selectedDay={charge.jourPrelevementMensuel}
        onSelectDay={handleUpdateDay}
      />

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

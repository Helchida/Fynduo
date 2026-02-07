import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "./PayeurPickerModal.style";
import { PayeurPickerModalProps } from "./PayeurPickerModal.type";

export const PayeurPickerModal = ({
  isVisible,
  onClose,
  users,
  selectedUid,
  onSelect,
  getDisplayName,
}: PayeurPickerModalProps) => (
  <Modal visible={isVisible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalHeader}>Qui a payé ?</Text>
        {users.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[
              styles.modalItem,
              selectedUid === u.id && styles.modalItemSelected,
            ]}
            onPress={() => onSelect(u.id)}
          >
            <Text style={styles.modalItemText}>{getDisplayName(u.id)}</Text>
            {selectedUid === u.id && (
              <Text style={{ color: "#3498DB" }}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

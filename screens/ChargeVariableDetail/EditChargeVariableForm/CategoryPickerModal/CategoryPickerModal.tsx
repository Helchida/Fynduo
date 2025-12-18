import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "./CategoryPickerModal.style";
import { CategoryPickerModalProps } from "./CategoryPickerModal.type";
import { CategoryType } from "@/types";

export const CategoryPickerModal = ({
  isVisible,
  onClose,
  selectedId,
  onSelect,
  categories,
}: CategoryPickerModalProps) => (
  <Modal visible={isVisible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalHeader}>Choisir une catégorie</Text>

        <ScrollView>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.modalItem,
                selectedId === cat.id && styles.modalItemSelected,
              ]}
              onPress={() => onSelect(cat.id as CategoryType)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                <Text style={styles.modalItemText}>{cat.label}</Text>
              </View>
              {selectedId === cat.id && (
                <Text style={{ color: "#3498DB", fontWeight: "bold" }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

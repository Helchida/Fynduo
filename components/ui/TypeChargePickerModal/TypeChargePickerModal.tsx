import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "./TypeChargePickerModal.style";
import { TypeChargePickerModalProps } from "./TypeChargePickerModal.type";
import { Repeat, Zap } from "lucide-react-native";

export const TypeChargePickerModal = ({
  isVisible,
  onClose,
  selectedId,
  onSelect,
}: TypeChargePickerModalProps) => {
  const types = [
    {
      id: "fixe",
      label: "Fixe",
      icon: <Repeat size={20} color="#3498DB" />,
      description: "Dépenses récurrentes (Loyer, EDF...)",
    },
    {
      id: "variable",
      label: "Variable",
      icon: <Zap size={20} color="#F1C40F" />,
      description: "Dépenses ponctuelles (Courses, Loisirs...)",
    },
  ];

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeaderContainer}>
            <Text style={styles.modalHeader}>Filtrer par type</Text>
          </View>

          <View style={{ paddingVertical: 10 }}>
            {types.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.modalItem,
                  selectedId === type.id && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onSelect(type.id as "fixe" | "variable");
                  onClose();
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View style={{ marginRight: 12 }}>{type.icon}</View>
                  <View>
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedId === type.id && {
                          fontWeight: "bold",
                          color: "#3498DB",
                        },
                      ]}
                    >
                      Charge {type.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#95a5a6" }}>
                      {type.description}
                    </Text>
                  </View>
                </View>

                {selectedId === type.id && (
                  <Text style={{ color: "#3498DB", fontWeight: "bold" }}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

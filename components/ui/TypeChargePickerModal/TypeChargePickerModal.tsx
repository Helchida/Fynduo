import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../../styles/components/ui/TypeChargePickerModal/TypeChargePickerModal.style";
import { common } from "../../../styles/common.style";
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
      <View style={common.modalOverlay}>
        <View style={common.modalContent}>
          <View style={styles.modalHeaderContainer}>
            <Text style={common.modalTitle}>Filtrer par type</Text>
          </View>

          <View style={{ paddingVertical: 10 }}>
            {types.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  common.modalItem,
                  selectedId === type.id && common.modalItemSelected,
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
                        common.modalItemText,
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

          <TouchableOpacity style={common.modalCloseButton} onPress={onClose}>
            <Text style={common.modalCloseButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

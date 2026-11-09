import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../../styles/components/ui/TypeChargePickerModal/TypeChargePickerModal.style";
import { common } from "../../../styles/common.style";
import { TypeChargePickerModalProps } from "./TypeChargePickerModal.type";
import { Repeat, Zap, Landmark } from "lucide-react-native";

export const TypeChargePickerModal = ({
  isVisible,
  onClose,
  selectedId,
  onSelect,
  isActiveHouseholdSolo = true,
}: TypeChargePickerModalProps & { isActiveHouseholdSolo?: boolean }) => {
  const types = [
    {
      id: "fixe",
      label: "Charge Fixe",
      icon: <Repeat size={20} color="#3498DB" />,
      description: "Dépenses récurrentes (Loyer, EDF...)",
      activeColor: "#3498DB",
    },
    {
      id: "variable",
      label: "Charge Variable",
      icon: <Zap size={20} color="#2ECC71" />,
      description: "Dépenses ponctuelles (Courses, Loisirs...)",
      activeColor: "#2ECC71",
    },

    ...(isActiveHouseholdSolo
      ? [
          {
            id: "epargne",
            label: "Épargne",
            icon: <Landmark size={20} color="#F39C12" />,
            description: "Placement épargnes",
            activeColor: "#F39C12",
          },
        ]
      : []),
  ];

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={common.modalOverlay}>
        <View style={common.modalContent}>
          <View style={styles.modalHeaderContainer}>
            <Text style={common.modalTitle}>Filtrer par type</Text>
          </View>

          <View style={{ paddingVertical: 10 }}>
            {types.map((type) => {
              const isSelected = selectedId === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    common.modalItem,
                    isSelected && common.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(type.id as "fixe" | "variable" | "epargne");
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
                          isSelected && {
                            fontWeight: "bold",
                            color: type.activeColor,
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#95a5a6" }}>
                        {type.description}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <Text
                      style={{ color: type.activeColor, fontWeight: "bold" }}
                    >
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={common.modalCloseButton} onPress={onClose}>
            <Text style={common.modalCloseButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

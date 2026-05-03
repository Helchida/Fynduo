import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "../../../../styles/screens/ChargeDetailScreen/EditChargeForm/CategoryPickerModal/CategoryPickerModal.style";
import { common } from "../../../../styles/common.style";
import { PeriodiciteType } from "@/types";
import {
  Calendar,
  CalendarDays,
  ClipboardList,
  MapPin,
  Repeat,
  Sun,
} from "lucide-react-native";

const PERIODICITY_OPTIONS: {
  id: PeriodiciteType;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}[] = [
  {
    id: "mensuel",
    label: "Mensuel",
    icon: Repeat,
    description: "Tous les X mois, le même jour",
    color: "#2ecc71",
  },
  {
    id: "annuel",
    label: "Annuel",
    icon: Calendar,
    description: "Tous les X ans, à une date fixe",
    color: "#9b59b6",
  },
  {
    id: "hebdomadaire",
    label: "Hebdomadaire",
    icon: CalendarDays,
    description: "Toutes les X semaines",
    color: "#27a1d1ff",
  },
  {
    id: "journalier",
    label: "Journalier",
    icon: Sun,
    description: "Tous les X jours",
    color: "#f39c12",
  },
  {
    id: "jour_nomme",
    label: "Jour nommé",
    icon: MapPin,
    description: "Ex : le 2ème lundi du mois",
    color: "#34495e",
  },
  {
    id: "echeancier",
    label: "Échéancier libre",
    icon: ClipboardList,
    description: "Dates et montants personnalisés",
    color: "#d14127ff",
  },
];

interface PeriodicityPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedId: PeriodiciteType;
  onSelect: (type: PeriodiciteType) => void;
}

export const PeriodicityPickerModal = ({
  isVisible,
  onClose,
  selectedId,
  onSelect,
}: PeriodicityPickerModalProps) => {
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={common.modalOverlay}>
        <View style={[common.modalContent, { maxHeight: "70%" }]}>
          <View style={styles.modalHeaderContainer}>
            <Text style={styles.modalHeader}>Périodicité</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {PERIODICITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedId === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.modalItem,
                    isSelected && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(option.id);
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
                    <View
                      style={{
                        marginRight: 14,
                        width: 30,
                        alignItems: "center",
                      }}
                    >
                      <Icon size={24} color={option.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemText}>{option.label}</Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: isSelected ? "#3498DB" : "#95a5a6",
                          marginTop: 2,
                        }}
                      >
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Text
                      style={{
                        color: "#3498DB",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

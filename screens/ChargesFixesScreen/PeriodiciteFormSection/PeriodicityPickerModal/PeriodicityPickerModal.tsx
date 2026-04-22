import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { styles } from "../../../../styles/screens/ChargeDetailScreen/EditChargeForm/CategoryPickerModal/CategoryPickerModal.style";
import { common } from "../../../../styles/common.style";
import { PeriodiciteType } from "@/types";

const PERIODICITY_OPTIONS: {
  id: PeriodiciteType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "mensuel",
    label: "Mensuel",
    icon: "🔁",
    description: "Tous les X mois, le même jour",
  },
  {
    id: "annuel",
    label: "Annuel",
    icon: "🗓️",
    description: "Tous les X ans, à une date fixe",
  },
  {
    id: "hebdomadaire",
    label: "Hebdomadaire",
    icon: "📆",
    description: "Toutes les X semaines",
  },
  {
    id: "journalier",
    label: "Journalier",
    icon: "☀️",
    description: "Tous les X jours",
  },
  {
    id: "jour_nomme",
    label: "Jour nommé",
    icon: "📌",
    description: "Ex : le 2ème lundi du mois",
  },
  {
    id: "echeancier",
    label: "Échéancier libre",
    icon: "📋",
    description: "Dates et montants personnalisés",
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
            {PERIODICITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.modalItem,
                  selectedId === option.id && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <Text style={{ fontSize: 24, marginRight: 14 }}>{option.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>{option.label}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: selectedId === option.id ? "#3498DB" : "#95a5a6",
                        marginTop: 2,
                      }}
                    >
                      {option.description}
                    </Text>
                  </View>
                </View>
                {selectedId === option.id && (
                  <Text style={{ color: "#3498DB", fontWeight: "bold", fontSize: 16 }}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Fermer</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};
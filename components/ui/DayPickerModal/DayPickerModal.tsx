import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { styles } from "./DayPickerModal.style";

interface DayPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

export const DayPickerModal: React.FC<DayPickerModalProps> = ({
  isVisible,
  onClose,
  selectedDay,
  onSelectDay,
}) => {
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Jour de prélèvement</Text>

              <FlatList
                data={days}
                numColumns={7}
                keyExtractor={(item) => item.toString()}
                columnWrapperStyle={{ justifyContent: "center" }}
                contentContainerStyle={{
                  paddingVertical: 10,
                  width: "100%",
                  alignItems: "center",
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      {
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        margin: 4,
                        borderRadius: 20,
                        backgroundColor: "#f0f0f0",
                      },
                      selectedDay === item && { backgroundColor: "#000" },
                    ]}
                    onPress={() => {
                      onSelectDay(item);
                      onClose();
                    }}
                  >
                    <Text
                      style={{
                        color: selectedDay === item ? "#fff" : "#000",
                        fontWeight: "bold",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onClose}
              >
                <Text style={styles.modalCloseButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

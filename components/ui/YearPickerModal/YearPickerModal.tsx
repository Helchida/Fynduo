import React, { useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import dayjs from "dayjs";
import { styles } from "./YearPickerModal.style";
import { YearPickerModalProps } from "./YearPickerModal.type";

export const YearPickerModal: React.FC<YearPickerModalProps> = ({
  isVisible,
  onClose,
  selectedYear,
  onSelect,
  chargesVariables,
}) => {
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    chargesVariables.forEach((charge) => {
      const year = dayjs(charge.dateStatistiques).format("YYYY");
      yearsSet.add(year);
    });

    return Array.from(yearsSet)
      .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
      .map((year) => ({
        value: year,
        label: dayjs(year).format("YYYY"),
      }));
  }, [chargesVariables]);

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Sélectionner une année</Text>
          <FlatList
            data={availableYears}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  item.value === selectedYear && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    item.value === selectedYear && styles.modalItemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

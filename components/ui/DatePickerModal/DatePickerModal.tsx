import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import dayjs from "dayjs";
import { DatePickerModalProps } from "./DatePickerModal.type";
import { styles } from "./DatePickerModal.style";

export const DatePickerModal = ({
  isVisible,
  onClose,
  date,
  onSelect,
}: DatePickerModalProps) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>Choisir une date</Text>

          <input
            type="date"
            defaultValue={dayjs(date).format("YYYY-MM-DD")}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.value) {
                onSelect(new Date(e.target.value));
              }
            }}
            style={styles.htmlInput}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={(e) => {
              onClose();
            }}
          >
            <Text style={styles.closeButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

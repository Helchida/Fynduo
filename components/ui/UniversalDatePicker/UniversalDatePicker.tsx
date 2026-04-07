import React from "react";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { DatePickerModal } from "../DatePickerModal/DatePickerModal";
import dayjs from "dayjs";
import { ChevronsUpDown } from "lucide-react-native";
import { common } from "../../../styles/common.style";

export const UniversalDatePicker = ({
  date,
  label,
  isVisible,
  onConfirm,
  onCancel,
  onOpen,
  styles,
  containerStyle,
}: any) => {
  if (Platform.OS === "web") {
    return (
      <>
        <TouchableOpacity
          style={[
            common.formContainer,
            common.payorCard,
            containerStyle,
          ]}
          onPress={onOpen}
        >
          <Text style={common.editLabel}>{label}</Text>
          <View style={styles.selectorContainer}>
            <Text style={styles.miniUserText}>
              {dayjs(date).format("DD/MM/YYYY")}
            </Text>
            <ChevronsUpDown size={14} color="#8E8E93" />
          </View>
        </TouchableOpacity>

        <DatePickerModal
          isVisible={isVisible}
          date={date}
          onClose={onCancel}
          onSelect={(newDate: Date) => {
            onConfirm(newDate);
            onCancel();
          }}
        />
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[
          common.formContainer,
          common.payorCard,
          containerStyle,
        ]}
        onPress={onOpen}
      >
        <Text style={common.editLabel}>{label}</Text>
        <View style={styles.selectorContainer}>
          <Text style={styles.miniUserText}>
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
          <ChevronsUpDown size={14} color="#8E8E93" />
        </View>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        date={date}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
        locale="fr_FR"
        textColor="black"
        {...({ themeVariant: "light" } as any)}
      />
    </>
  );
};
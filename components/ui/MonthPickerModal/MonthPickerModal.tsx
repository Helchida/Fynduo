import React, { useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import dayjs from "dayjs";
import { styles } from "./MonthPickerModal.style";
import { MonthPickerModalProps } from "./MonthPickerModal.type";

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
    isVisible,
    onClose,
    selectedMonth,
    onSelect,
    chargesVariables,
}) => {
    const availableMonths = useMemo(() => {
        const monthsSet = new Set<string>();
        chargesVariables.forEach((charge) => {
            const month = dayjs(charge.dateStatistiques).format("YYYY-MM");
            monthsSet.add(month);
        });

        return Array.from(monthsSet)
            .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
            .map((month) => ({
                value: month,
                label: dayjs(month).format("MMMM YYYY"),
            }));
    }, [chargesVariables]);

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalHeader}>Sélectionner un mois</Text>
                    <FlatList
                        data={availableMonths}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.modalItem,
                                    item.value === selectedMonth && styles.modalItemSelected,
                                ]}
                                onPress={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalItemText,
                                        item.value === selectedMonth && styles.modalItemTextSelected,
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
import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import dayjs from "dayjs";
import { styles } from "./PeriodPickerModal.style";
import { PeriodPickerModalProps } from "./PeriodPickerModal.type";

export const PeriodPickerModal: React.FC<PeriodPickerModalProps> = ({
  isVisible,
  onClose,
  selectedMonth,
  selectedYear,
  onSelectMonth,
  onSelectYear,
  chargesVariables,
}) => {
  const [activeTab, setActiveTab] = useState<"month" | "year">(
    selectedYear ? "year" : "month"
  );
  const options = useMemo(() => {
    const months = new Set<string>();
    const years = new Set<string>();

    chargesVariables.forEach((c) => {
      const date = dayjs(c.dateStatistiques);
      months.add(date.format("YYYY-MM"));
      years.add(date.format("YYYY"));
    });

    return {
      months: Array.from(months).sort((a, b) => b.localeCompare(a)),
      years: Array.from(years).sort((a, b) => b.localeCompare(a)),
    };
  }, [chargesVariables]);

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Sélectionner la période</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeButton}>Fermer</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "month" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("month")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "month" && styles.activeTabText,
                    ]}
                  >
                    Mois
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === "year" && styles.activeTab]}
                  onPress={() => setActiveTab("year")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "year" && styles.activeTabText,
                    ]}
                  >
                    Année
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeTab === "month"
                  ? options.months.map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.item,
                          selectedMonth === m && styles.selectedItem,
                        ]}
                        onPress={() => onSelectMonth(m)}
                      >
                        <Text
                          style={[
                            styles.itemText,
                            selectedMonth === m && styles.selectedItemText,
                          ]}
                        >
                          {dayjs(m).format("MMMM YYYY")}
                        </Text>
                      </TouchableOpacity>
                    ))
                  : options.years.map((y) => (
                      <TouchableOpacity
                        key={y}
                        style={[
                          styles.item,
                          selectedYear === y && styles.selectedItem,
                        ]}
                        onPress={() => onSelectYear(y)}
                      >
                        <Text
                          style={[
                            styles.itemText,
                            selectedYear === y && styles.selectedItemText,
                          ]}
                        >
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

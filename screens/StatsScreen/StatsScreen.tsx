import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { styles } from "./StatsScreen.style";
import { useComptes } from "../../hooks/useComptes";
import { useCategories } from "../../hooks/useCategories";
import { useStats } from "../../hooks/useStats";
import { useAuth } from "../../hooks/useAuth";
import { PieChart } from "react-native-gifted-charts";
import { PeriodPickerModal } from "../../components/ui/PeriodPickerModal/PeriodPickerModal";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { StatPeriod } from "@/types";

dayjs.locale("fr");

const { width } = Dimensions.get("window");

const StatsScreen: React.FC = () => {
  const { chargesVariables } = useComptes();
  const { categories } = useCategories();
  const { user } = useAuth();

  const [period, setPeriod] = useState<StatPeriod>("mois");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format("YYYY-MM"),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    dayjs().format("YYYY"),
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isSoloMode = user?.activeHouseholdId === user?.id;

  const referenceDate = period === "annee" ? selectedYear : selectedMonth;

  const { statsParCategorie, total } = useStats(
    chargesVariables,
    categories,
    period,
    referenceDate,
    user?.id,
    isSoloMode,
  );

  const colorScale = [
    "#4E79A7",
    "#F28E2B",
    "#E15759",
    "#76B7B2",
    "#59A14F",
    "#EDC948",
  ];

  const pieData =
    statsParCategorie.length > 0
      ? statsParCategorie.map((item, index) => ({
          value: item.montant,
          color: colorScale[index % colorScale.length],
          label: item.label,
        }))
      : [{ value: 1, color: "#F1F3F5" }];

  const formatMonth = (monthStr: string) => {
    const formatted = dayjs(monthStr).format("MMMM YYYY");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setIsModalVisible(false);
  };

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
    setIsModalVisible(false);
  };

  const handleOpenPeriodPicker = () => {
    if (period !== "tout") {
      setIsModalVisible(true);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.header}>Statistiques</Text>

      <View style={styles.tabContainer}>
        {(["mois", "annee", "tout"] as StatPeriod[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.tab, period === p && styles.activeTab]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[styles.tabText, period === p && styles.activeTabText]}
            >
              {p === "mois" ? "Mois" : p === "annee" ? "Année" : "Total"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {period !== "tout" && (
        <TouchableOpacity
          style={styles.periodButton}
          onPress={handleOpenPeriodPicker}
        >
          <Text style={styles.periodButtonText}>
            {period === "mois" ? formatMonth(selectedMonth) : selectedYear}
          </Text>
          <Text style={styles.periodButtonIcon}>▼</Text>
        </TouchableOpacity>
      )}

      <View style={styles.chartCard}>
        <View style={styles.chartWrapper}>
          <PieChart
            donut
            radius={width * 0.35}
            innerRadius={width * 0.22}
            data={pieData}
            centerLabelComponent={() => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={styles.totalAmount}>{total.toFixed(2)}€</Text>
                <Text style={styles.totalLabel}>
                  {isSoloMode ? "Ma Part" : "Total Foyer"}
                </Text>
              </View>
            )}
          />
        </View>

        <View style={styles.legendWrapper}>
          {statsParCategorie.map((item, index) => {
            const color = colorScale[index % colorScale.length];
            const percent =
              total > 0 ? ((item.montant / total) * 100).toFixed(0) : 0;

            return (
              <View key={item.categoryId} style={styles.legendItem}>
                <View
                  style={[styles.iconBox, { backgroundColor: `${color}15` }]}
                >
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{item.label}</Text>
                  <Text style={styles.catPercent}>{percent}% des dépenses</Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.catValue}>
                    {item.montant.toFixed(2)}€
                  </Text>
                  <View
                    style={[styles.indicator, { backgroundColor: color }]}
                  />
                </View>
              </View>
            );
          })}

          {statsParCategorie.length === 0 && (
            <Text style={styles.emptyText}>
              Aucune dépense sur cette période.
            </Text>
          )}
        </View>
      </View>

      <PeriodPickerModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        selectedMonth={period === "mois" ? selectedMonth : null}
        selectedYear={period === "annee" ? selectedYear : null}
        onSelectMonth={handleSelectMonth}
        onSelectYear={handleSelectYear}
        chargesVariables={chargesVariables}
        mode={period === "mois" ? "month" : "year"}
      />
    </ScrollView>
  );
};

export default StatsScreen;

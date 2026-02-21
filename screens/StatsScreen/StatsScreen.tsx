import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { styles } from "./StatsScreen.style";
import { useComptes } from "../../hooks/useComptes";
import { useCategories } from "../../hooks/useCategories";
import { useStats } from "../../hooks/useStats";
import { useRevenusStats } from "../../hooks/useRevenusStats";
import { useAuth } from "../../hooks/useAuth";
import { PeriodPickerModal } from "../../components/ui/PeriodPickerModal/PeriodPickerModal";
import { ChargesVariablesStatsCard } from "./ChargesVariablesStatsCard/ChargesVariablesStatsCard";
import { RevenusStatsCard } from "./RevenusStatsCard/RevenusStatsCard";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { StatPeriod } from "@/types";
import { useHouseholdUsers } from "hooks/useHouseholdUsers";

dayjs.locale("fr");

type ViewMode = "charges" | "revenus";

const StatsScreen: React.FC = () => {
  const { charges, revenus } = useComptes();
  const { categories, categoriesRevenus } = useCategories();
  const { user } = useAuth();
  const { householdUsers } = useHouseholdUsers();

  const [period, setPeriod] = useState<StatPeriod>("mois");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format("YYYY-MM"),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    dayjs().format("YYYY"),
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("charges");

  const isSoloMode = user?.activeHouseholdId === user?.id;

  // En mode partagé, on force l'affichage sur les charges (pas de revenus partagés)
  const effectiveViewMode: ViewMode = isSoloMode ? viewMode : "charges";

  const referenceDate = period === "annee" ? selectedYear : selectedMonth;

  const { statsParCategorie, total } = useStats(
    charges,
    categories,
    period,
    referenceDate,
    user?.id,
    isSoloMode,
  );

  const { statsRevenusParCategorie, totalRevenus } = useRevenusStats(
    revenus,
    categoriesRevenus,
    period,
    referenceDate,
    user?.id,
  );

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

  const getDisplayName = (uid: string) => {
    const found = householdUsers.find((u) => u.id === uid);
    return found ? found.displayName : "Inconnu";
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

      {isSoloMode && (
        <View style={viewToggleStyles.container}>
          <TouchableOpacity
            style={[
              viewToggleStyles.button,
              viewMode === "charges" && viewToggleStyles.buttonActiveCharges,
            ]}
            onPress={() => setViewMode("charges")}
          >
            <Text
              style={[
                viewToggleStyles.buttonText,
                viewMode === "charges" && viewToggleStyles.buttonTextActive,
              ]}
            >
              💸 Charges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              viewToggleStyles.button,
              viewMode === "revenus" && viewToggleStyles.buttonActiveRevenus,
            ]}
            onPress={() => setViewMode("revenus")}
          >
            <Text
              style={[
                viewToggleStyles.buttonText,
                viewMode === "revenus" && viewToggleStyles.buttonTextActive,
              ]}
            >
              💰 Revenus
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {effectiveViewMode === "charges" ? (
        <ChargesVariablesStatsCard
          charges={charges}
          statsParCategorie={statsParCategorie}
          total={total}
          period={period}
          referenceDate={referenceDate}
          isSoloMode={isSoloMode}
          getDisplayName={getDisplayName}
        />
      ) : (
        <RevenusStatsCard
          revenus={revenus}
          statsRevenusParCategorie={statsRevenusParCategorie}
          totalRevenus={totalRevenus}
          period={period}
          referenceDate={referenceDate}
          isSoloMode={isSoloMode}
        />
      )}

      <PeriodPickerModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        selectedMonth={period === "mois" ? selectedMonth : null}
        selectedYear={period === "annee" ? selectedYear : null}
        onSelectMonth={handleSelectMonth}
        onSelectYear={handleSelectYear}
        charges={charges}
        mode={period === "mois" ? "month" : "year"}
      />
    </ScrollView>
  );
};

const viewToggleStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  buttonActiveCharges: {
    backgroundColor: "#FFFFFF",
    elevation: 3,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  buttonActiveRevenus: {
    backgroundColor: "#FFFFFF",
    elevation: 3,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  buttonText: {
    fontWeight: "600",
    color: "#6C757D",
    fontSize: 14,
  },
  buttonTextActive: {
    color: "#007AFF",
  },
});

export default StatsScreen;
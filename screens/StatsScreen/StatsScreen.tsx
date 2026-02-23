import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import { styles } from "./StatsScreen.style";
import { useComptes } from "../../hooks/useComptes";
import { useCategories } from "../../hooks/useCategories";
import { useStats } from "../../hooks/useStats";
import { useRevenusStats } from "../../hooks/useRevenusStats";
import { useAuth } from "../../hooks/useAuth";
import { PeriodPickerModal } from "../../components/ui/PeriodPickerModal/PeriodPickerModal";
import { ChargesStatsCard } from "./ChargesStatsCard/ChargesStatsCard";
import { RevenusStatsCard } from "./RevenusStatsCard/RevenusStatsCard";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { StatPeriod } from "@/types";
import { useHouseholdUsers } from "hooks/useHouseholdUsers";
import { ChevronDown, ChevronUp } from "lucide-react-native";

dayjs.locale("fr");

type ViewMode = "dépenses" | "revenus";

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
  const [viewMode, setViewMode] = useState<ViewMode>("dépenses");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  const isSoloMode = user?.activeHouseholdId === user?.id;
  const effectiveViewMode: ViewMode = isSoloMode ? viewMode : "dépenses";

  const referenceDate = period === "annee" ? selectedYear : selectedMonth;

  const {
    variablesStatsParCategorie,
    totalVariable,
    fixesStatsParCategorie,
    totalFixe,
    allChargesStatsParCategorie,
    totalAllCharges,
  } = useStats(
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
      <View style={styles.headerRow}>
        <Text style={styles.header}>Statistiques</Text>

        {isSoloMode && (
          <View>
            <TouchableOpacity
              ref={triggerRef}
              style={styles.trigger}
              onPress={() => {
                triggerRef.current?.measureInWindow((x, y, width, height) => {
                  setDropdownPosition({
                    top: y + height + 6,
                    right: 20,
                  });
                  setIsDropdownOpen(true);
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.triggerText}>
                {viewMode === "dépenses" ? "💸 Dépenses" : "💰 Revenus"}
              </Text>
                {isDropdownOpen ? <ChevronUp color="#2c3e50" size={16} /> : <ChevronDown color="#2c3e50" size={16} />}
            </TouchableOpacity>

            <Modal
              visible={isDropdownOpen}
              transparent
              animationType="none"
              onRequestClose={() => setIsDropdownOpen(false)}
            >
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setIsDropdownOpen(false)}
              >
                <View
                  style={[
                    styles.menu,
                    {
                      top: dropdownPosition.top,
                      right: dropdownPosition.right,
                    },
                  ]}
                >
                  {(["dépenses", "revenus"] as ViewMode[]).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.menuItem,
                        viewMode === mode && styles.menuItemActive,
                      ]}
                      onPress={() => {
                        setViewMode(mode);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.menuItemText,
                          viewMode === mode && styles.menuItemTextActive,
                        ]}
                      >
                        {mode === "dépenses" ? "💸 Dépenses" : "💰 Revenus"}
                      </Text>
                      {viewMode === mode && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>
        )}
      </View>

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

          <ChevronDown color="#2c3e50" size={28} />
        </TouchableOpacity>
      )}

      {effectiveViewMode === "dépenses" ? (
        <>
          <ChargesStatsCard
            charges={charges}
            statsParCategorie={variablesStatsParCategorie}
            total={totalVariable}
            period={period}
            referenceDate={referenceDate}
            isSoloMode={isSoloMode}
            getDisplayName={getDisplayName}
            chargeType={"variable"}
          />
          <ChargesStatsCard
            charges={charges}
            statsParCategorie={fixesStatsParCategorie}
            total={totalFixe}
            period={period}
            referenceDate={referenceDate}
            isSoloMode={isSoloMode}
            getDisplayName={getDisplayName}
            chargeType={"fixe"}
          />
          <ChargesStatsCard
            charges={charges}
            statsParCategorie={allChargesStatsParCategorie}
            total={totalAllCharges}
            period={period}
            referenceDate={referenceDate}
            isSoloMode={isSoloMode}
            getDisplayName={getDisplayName}
          />
        </>
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

export default StatsScreen;

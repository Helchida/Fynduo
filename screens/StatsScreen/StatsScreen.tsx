import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import { styles } from "../../styles/screens/StatsScreen/StatsScreen.style";
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
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Landmark,
  Lightbulb,
} from "lucide-react-native";
import { EpargneStatsCard } from "./EpargnesStatsCard/EpargnesStatsCard";
import { useEpargneStats } from "hooks/useEpargnesStats";
import { useEpargneData } from "hooks/useEpargneData";
import { useFocusEffect } from "@react-navigation/native";
import { common } from "styles/common.style";
import { InfoModal } from "components/ui/InfoModal/InfoModal";
import { useScreenInfo } from "hooks/useScreenInfo";

dayjs.locale("fr");

type ViewMode = "dépenses" | "revenus" | "épargnes";

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
  const { showInfoModal, setShowInfoModal } = useScreenInfo();

  const isSoloMode = user?.activeHouseholdId === user?.id;
  const effectiveViewMode: ViewMode = isSoloMode ? viewMode : "dépenses";

  const referenceDate = period === "annee" ? selectedYear : selectedMonth;

  const { tirelires, refresh: refreshEpargne } = useEpargneData(
    user?.id,
    referenceDate,
  );

  useFocusEffect(
    useCallback(() => {
      refreshEpargne();
    }, [refreshEpargne]),
  );

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

  const { statsParTirelire, totalDepose, totalRetire } = useEpargneStats(
    tirelires,
    period,
    referenceDate,
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
              <View style={common.row}>
                {viewMode === "dépenses" ? (
                  <BanknoteArrowDown size={16} color={"#25cc0f"} />
                ) : viewMode === "revenus" ? (
                  <BanknoteArrowUp size={16} color={"#0f77cc"} />
                ) : (
                  <Landmark size={16} color={"#870fcc"} />
                )}

                <Text style={styles.triggerText}>
                  {viewMode === "dépenses"
                    ? " Dépenses"
                    : viewMode === "revenus"
                      ? " Revenus"
                      : " Épargne"}
                </Text>
              </View>

              {isDropdownOpen ? (
                <ChevronUp color="#2c3e50" size={16} />
              ) : (
                <ChevronDown color="#2c3e50" size={16} />
              )}
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
                  {(["dépenses", "revenus", "épargnes"] as ViewMode[]).map(
                    (mode) => (
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
                        <View style={common.row}>
                          {mode === "dépenses" ? (
                            <BanknoteArrowDown size={16} color={"#25cc0f"} />
                          ) : mode === "revenus" ? (
                            <BanknoteArrowUp size={16} color={"#0f77cc"} />
                          ) : (
                            <Landmark size={16} color={"#870fcc"} />
                          )}
                          <Text
                            style={[
                              styles.menuItemText,
                              viewMode === mode && styles.menuItemTextActive,
                            ]}
                          >
                            {mode === "dépenses"
                              ? " Dépenses"
                              : mode === "revenus"
                                ? " Revenus"
                                : " Épargne"}
                          </Text>
                        </View>
                        {viewMode === mode && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ),
                  )}
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

      {effectiveViewMode === "dépenses" && (
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
      )}

      {effectiveViewMode === "revenus" && (
        <RevenusStatsCard
          revenus={revenus}
          statsRevenusParCategorie={statsRevenusParCategorie}
          totalRevenus={totalRevenus}
          period={period}
          referenceDate={referenceDate}
          isSoloMode={isSoloMode}
        />
      )}

      {effectiveViewMode === "épargnes" && (
        <EpargneStatsCard
          statsParTirelire={statsParTirelire}
          totalDepose={totalDepose}
          totalRetire={totalRetire}
          period={period}
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
      <InfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      >
        <View style={common.centerRow}>
          <BarChart2
            size={30}
            color={"#2980B9"}
            style={common.infoModalIconTitle}
          />
          <Text style={common.infoModalTitle}>À propos des statistiques</Text>
        </View>

        <Text style={common.infoModalText}>
          L'écran de statistiques vous donne une vue globale de vos{" "}
          <Text style={common.bold}>dépenses</Text>,{" "}
          <Text style={common.bold}>revenus</Text> et{" "}
          <Text style={common.bold}>épargne</Text>. Vous pouvez filtrer par
          mois, par année ou sur la totalité de vos données.
        </Text>

        <Text style={common.infoModalText}>
          Chaque section présente un détail par{" "}
          <Text style={common.bold}>catégorie</Text> avec son pourcentage
          représentatif. Appuyez sur une catégorie pour afficher le{" "}
          <Text style={common.bold}>détail des éléments</Text> qui la composent.
        </Text>

        <Text style={common.infoModalText}>
          Les statistiques d'épargne distinguent les{" "}
          <Text style={common.bold}>dépôts</Text> et les{" "}
          <Text style={common.bold}>retraits</Text> par tirelire, afin de suivre
          précisément l'évolution de votre épargne dans le temps.
        </Text>

        <View style={[common.infoModalBox, common.trickBox]}>
          <View style={common.row}>
            <Lightbulb
              size={14}
              color={"#004085"}
              style={common.boxIconTitle}
            />
            <Text style={[common.boxTitle, common.trickTitle]}> Astuce</Text>
          </View>
          <Text style={[common.boxText, common.trickText]}>
            Sélectionnez <Text style={common.bold}>Totalité</Text> pour
            identifier vos postes de dépenses dominants sur toute la durée
            d'utilisation de l'application.
          </Text>
        </View>
      </InfoModal>
    </ScrollView>
  );
};

export default StatsScreen;

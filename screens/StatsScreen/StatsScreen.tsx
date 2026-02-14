import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
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
import { useHouseholdUsers } from "hooks/useHouseholdUsers";

dayjs.locale("fr");

const { width } = Dimensions.get("window");

const StatsScreen: React.FC = () => {
  const { charges } = useComptes();
  const { categories } = useCategories();
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
  const [focusedSlice, setFocusedSlice] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const isSoloMode = user?.activeHouseholdId === user?.id;

  const referenceDate = period === "annee" ? selectedYear : selectedMonth;

  const { statsParCategorie, total } = useStats(
    charges,
    categories,
    period,
    referenceDate,
    user?.id,
    isSoloMode,
  );

  const filteredCharges = useMemo(() => {
    return charges.filter((c) => {
      if (c.type === "fixe") return false;
      if (period === "tout") return true;

      const chargeMoisAnnee =
        dayjs(c.dateStatistiques).format("YYYY-MM");

      if (period === "mois") return chargeMoisAnnee === referenceDate;
      if (period === "annee") return chargeMoisAnnee.startsWith(referenceDate);
      return true;
    });
  }, [charges, period, referenceDate]);

  const chargesByCategory = useMemo(() => {
    const grouped: Record<string, typeof charges> = {};
    filteredCharges.forEach((charge) => {
      const catId = charge.categorie || "cat_autre";
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(charge);
    });
    return grouped;
  }, [filteredCharges]);

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
          focused: focusedSlice === index,
          onPress: () => handleSlicePress(index),
          onLongPress: () => handleSlicePress(index),
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

  const handleSlicePress = (index: number) => {
    if (focusedSlice === index) {
      setFocusedSlice(null);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      setFocusedSlice(index);
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleOpenPeriodPicker = () => {
    if (period !== "tout") {
      setIsModalVisible(true);
    }
  };

  const getDisplayName = (uid: string) => {
    const user = householdUsers.find((u) => u.id === uid);
    return user ? user.displayName : "Inconnu";
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
        <View style={styles.chartTitleContainer}>
          <Text style={styles.chartTitle}>Charges variables</Text>
          <View style={styles.chartTitleUnderline} />
        </View>
        <View style={styles.chartWrapper}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <PieChart
              donut
              radius={width * 0.35}
              innerRadius={width * 0.22}
              data={pieData}
              focusOnPress
              centerLabelComponent={() => {
                if (focusedSlice !== null && statsParCategorie[focusedSlice]) {
                  const item = statsParCategorie[focusedSlice];
                  const percent =
                    total > 0 ? ((item.montant / total) * 100).toFixed(1) : 0;
                  return (
                    <View
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <Text style={{ fontSize: 24, marginBottom: 4 }}>
                        {item.icon}
                      </Text>
                      <Text style={styles.focusedCategory}>{item.label}</Text>
                      <Text style={styles.focusedPercentage}>{percent}%</Text>
                      <Text style={styles.focusedAmount}>
                        {item.montant.toFixed(2)}€
                      </Text>
                    </View>
                  );
                }
                return (
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={styles.totalAmount}>{total.toFixed(2)}€</Text>
                    <Text style={styles.totalLabel}>
                      {isSoloMode ? "Ma Part" : "Total Foyer"}
                    </Text>
                  </View>
                );
              }}
            />
          </Animated.View>
        </View>

        <View style={styles.legendWrapper}>
          {statsParCategorie.map((item, index) => {
            const color = colorScale[index % colorScale.length];
            const percentValue = total > 0 ? (item.montant / total) * 100 : 0;
            const rounded = Math.round(percentValue * 10) / 10;
            const percent =
              rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
            const isExpanded = expandedCategory === item.categoryId;
            const categoryCharges = chargesByCategory[item.categoryId] || [];

            return (
              <View key={item.categoryId}>
                <TouchableOpacity
                  style={styles.legendItem}
                  onPress={() =>
                    setExpandedCategory(isExpanded ? null : item.categoryId)
                  }
                >
                  <View
                    style={[styles.iconBox, { backgroundColor: `${color}15` }]}
                  >
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.catName}>{item.label}</Text>
                    <Text style={styles.catPercent}>
                      {percent}% des dépenses
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.catValue}>
                      {item.montant.toFixed(2)}€
                    </Text>
                    <View
                      style={[styles.indicator, { backgroundColor: color }]}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && categoryCharges.length > 0 && (
                  <View style={styles.chargesList}>
                    {categoryCharges.map((charge, idx) => {
                      const payeurName = getDisplayName(charge.payeur);
                      const montantAffiche =
                        isSoloMode &&
                        charge.beneficiaires &&
                        charge.beneficiaires.length > 0
                          ? (
                              Number(charge.montantTotal) /
                              charge.beneficiaires.length
                            ).toFixed(2)
                          : Number(charge.montantTotal).toFixed(2);

                      return (
                        <View
                          key={`${charge.id}-${idx}`}
                          style={styles.chargeItem}
                        >
                          <View style={styles.chargeInfo}>
                            <Text style={styles.chargeLabel}>
                              {charge.description}
                            </Text>
                            {!isSoloMode && (
                              <Text style={styles.chargePayeur}>
                                Payé par {payeurName}
                              </Text>
                            )}
                          </View>

                          <View style={styles.chargeMontantContainer}>
                            <Text style={styles.chargeMontant}>
                              {montantAffiche}€
                            </Text>
                            <Text style={styles.chargeDate}>
                              {dayjs(charge.dateStatistiques).format("DD/MM")}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
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
        charges={charges}
        mode={period === "mois" ? "month" : "year"}
      />
    </ScrollView>
  );
};

export default StatsScreen;

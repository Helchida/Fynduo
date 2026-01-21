import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { styles } from "./StatsScreen.style";
import { useComptes } from "../../hooks/useComptes";
import { useCategories } from "../../hooks/useCategories";
import { useStats } from "../../hooks/useStats";
import { useAuth } from "../../hooks/useAuth";
import { PieChart } from "react-native-gifted-charts";
import dayjs from "dayjs";
import { StatPeriod } from "@/types";

const { width } = Dimensions.get("window");

const StatsScreen: React.FC = () => {
  const { chargesVariables } = useComptes();
  const { categories } = useCategories();
  const { user } = useAuth();

  const [period, setPeriod] = useState<StatPeriod>("mois");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format("YYYY-MM"),
  );

  const isSoloMode = user?.activeHouseholdId === user?.id;

  const { statsParCategorie, total } = useStats(
    chargesVariables,
    categories,
    period,
    selectedMonth,
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
              {p === "mois"
                ? "Ce mois"
                : p === "annee"
                  ? "Cette année"
                  : "Total"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
    </ScrollView>
  );
};

export default StatsScreen;

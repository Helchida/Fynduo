import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { revenusStatsCardStyles as styles } from "./RevenusStatsCard.style";
import { RevenusStatsCardProps } from "./RevenusStatsCard.type";
import { PieChart } from "react-native-gifted-charts";
import dayjs from "dayjs";

const { width } = Dimensions.get("window");

const colorScale = [
  "#3498db",
  "#2ecc71",
  "#9b59b6",
  "#1abc9c",
  "#f39c12",
  "#e74c3c",
];

export const RevenusStatsCard: React.FC<RevenusStatsCardProps> = ({
  revenus,
  statsRevenusParCategorie,
  totalRevenus,
  period,
  referenceDate,
  isSoloMode,
}) => {
  const [focusedSlice, setFocusedSlice] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const filteredRevenus = useMemo(() => {
    return revenus.filter((r) => {
      if (period === "tout") return true;

      const revenuMoisAnnee = dayjs(r.dateReception).format("YYYY-MM");

      if (period === "mois") return revenuMoisAnnee === referenceDate;
      if (period === "annee") return revenuMoisAnnee.startsWith(referenceDate);
      return true;
    });
  }, [revenus, period, referenceDate]);

  const revenusByCategory = useMemo(() => {
    const grouped: Record<string, typeof revenus> = {};
    filteredRevenus.forEach((revenu) => {
      const catId = revenu.categorie || "cat_autre";
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(revenu);
    });
    return grouped;
  }, [filteredRevenus]);

  const pieData =
    statsRevenusParCategorie.length > 0
      ? statsRevenusParCategorie.map((item, index) => ({
          value: item.montant,
          color: colorScale[index % colorScale.length],
          label: item.label,
          focused: focusedSlice === index,
          onPress: () => handleSlicePress(index),
          onLongPress: () => handleSlicePress(index),
        }))
      : [{ value: 1, color: "#F1F3F5" }];

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

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartTitleContainer}>
        <Text style={styles.chartTitle}>Revenus</Text>
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
              if (
                focusedSlice !== null &&
                statsRevenusParCategorie[focusedSlice]
              ) {
                const item = statsRevenusParCategorie[focusedSlice];
                const percent =
                  totalRevenus > 0
                    ? ((item.montant / totalRevenus) * 100).toFixed(1)
                    : 0;
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
                  <Text style={styles.totalAmount}>
                    {totalRevenus.toFixed(2)}€
                  </Text>
                  <Text style={styles.totalLabel}>
                    {isSoloMode ? "Mes Revenus" : "Total Foyer"}
                  </Text>
                </View>
              );
            }}
          />
        </Animated.View>
      </View>

      <View style={styles.legendWrapper}>
        {statsRevenusParCategorie.map((item, index) => {
          const color = colorScale[index % colorScale.length];
          const percentValue =
            totalRevenus > 0 ? (item.montant / totalRevenus) * 100 : 0;
          const rounded = Math.round(percentValue * 10) / 10;
          const percent =
            rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
          const isExpanded = expandedCategory === item.categoryId;
          const categoryRevenus = revenusByCategory[item.categoryId] || [];

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
                  <Text style={styles.catPercent}>{percent}% des revenus</Text>
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

              {isExpanded && categoryRevenus.length > 0 && (
                <View style={styles.revenusList}>
                  {categoryRevenus.map((revenu, idx) => {
                    const montantAffiche = Number(revenu.montant).toFixed(2);

                    return (
                      <View
                        key={`${revenu.id}-${idx}`}
                        style={styles.revenuItem}
                      >
                        <View style={styles.revenuInfo}>
                          <Text style={styles.revenuLabel}>
                            {revenu.description}
                          </Text>
                        </View>

                        <View style={styles.revenuMontantContainer}>
                          <Text style={styles.revenuMontant}>
                            +{montantAffiche}€
                          </Text>
                          <Text style={styles.revenuDate}>
                            {dayjs(revenu.dateReception).format("DD/MM")}
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

        {statsRevenusParCategorie.length === 0 && (
          <Text style={styles.emptyText}>
            Aucun revenu sur cette période.
          </Text>
        )}
      </View>
    </View>
  );
};
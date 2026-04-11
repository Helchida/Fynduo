import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { EpargneStatsCardProps } from "./EpargnesStatsCard.type";
import { styles } from "../../../styles/screens/StatsScreen/EpargnesStatsCard/EpargnesStatsCard.style";
import { common } from "styles/common.style";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react-native";

dayjs.locale("fr");

const { width } = Dimensions.get("window");

const colorScale = [
  "#4E79A7",
  "#F28E2B",
  "#E15759",
  "#76B7B2",
  "#59A14F",
  "#EDC948",
];

export const EpargneStatsCard: React.FC<EpargneStatsCardProps> = ({
  statsParTirelire,
  totalDepose,
  totalRetire,
  period,
}) => {
  // ── États séparés pour chaque PieChart ───────────────────────
  const [focusedDepotSlice, setFocusedDepotSlice] = useState<number | null>(null);
  const [focusedRetraitSlice, setFocusedRetraitSlice] = useState<number | null>(null);
  const scaleAnimDepot = useState(new Animated.Value(1))[0];
  const scaleAnimRetrait = useState(new Animated.Value(1))[0];

  const [expandedTirelire, setExpandedTirelire] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ── Données triées du plus grand au plus petit ───────────────
  const statsAvecDepots = [...statsParTirelire]
    .filter((s) => s.totalDepose > 0)
    .sort((a, b) => b.totalDepose - a.totalDepose);

  const statsAvecRetraits = [...statsParTirelire]
    .filter((s) => s.totalRetire > 0)
    .sort((a, b) => b.totalRetire - a.totalRetire);

  const totalPieDepots = statsAvecDepots.reduce((s, i) => s + i.totalDepose, 0);
  const totalPieRetraits = statsAvecRetraits.reduce((s, i) => s + i.totalRetire, 0);

  // ── PieData Dépôts ────────────────────────────────────────────
  const pieDataDepots =
    statsAvecDepots.length > 0
      ? statsAvecDepots.map((item, index) => ({
          value: item.totalDepose,
          color: colorScale[index % colorScale.length],
          focused: focusedDepotSlice === index,
          onPress: () => handleDepotSlicePress(index),
          onLongPress: () => handleDepotSlicePress(index),
        }))
      : [{ value: 1, color: "#F1F3F5" }];

  // ── PieData Retraits ──────────────────────────────────────────
  const pieDataRetraits =
    statsAvecRetraits.length > 0
      ? statsAvecRetraits.map((item, index) => ({
          value: item.totalRetire,
          color: colorScale[index % colorScale.length],
          focused: focusedRetraitSlice === index,
          onPress: () => handleRetraitSlicePress(index),
          onLongPress: () => handleRetraitSlicePress(index),
        }))
      : [{ value: 1, color: "#F1F3F5" }];

  // ── Handlers séparés ─────────────────────────────────────────
  const handleDepotSlicePress = (index: number) => {
    if (focusedDepotSlice === index) {
      setFocusedDepotSlice(null);
      Animated.spring(scaleAnimDepot, { toValue: 1, useNativeDriver: true }).start();
    } else {
      setFocusedDepotSlice(index);
      Animated.spring(scaleAnimDepot, { toValue: 1.15, useNativeDriver: true }).start();
    }
  };

  const handleRetraitSlicePress = (index: number) => {
    if (focusedRetraitSlice === index) {
      setFocusedRetraitSlice(null);
      Animated.spring(scaleAnimRetrait, { toValue: 1, useNativeDriver: true }).start();
    } else {
      setFocusedRetraitSlice(index);
      Animated.spring(scaleAnimRetrait, { toValue: 1.15, useNativeDriver: true }).start();
    }
  };

  const hasAnyMovement = statsParTirelire.length > 0;
  const hasAnyRetrait = statsAvecRetraits.length > 0;
  const hasAnyDepot = statsAvecDepots.length > 0;

  return (
    <>
      {/* ════════════════ CARTE DÉPÔTS ════════════════ */}
      <View style={styles.chartCard}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsCollapsed(!isCollapsed)}
          style={styles.chartTitleContainer}
        >
          <View style={{ width: 20 }} />
          <View style={styles.titleWrapper}>
            <Text style={styles.chartTitle}>Dépots</Text>
            <View
              style={[styles.chartTitleUnderline, { backgroundColor: "#2ecc71" }]}
            />
          </View>
          {isCollapsed ? (
            <ChevronDown color="#2c3e50" size={28} />
          ) : (
            <ChevronUp color="#2c3e50" size={28} />
          )}
        </TouchableOpacity>

        {!isCollapsed && (
          <>
            <View style={common.chartWrapper}>
              {!hasAnyDepot ? (
                <Text style={common.emptyText}>Aucun dépôt sur cette période.</Text>
              ) : (
                <Animated.View style={{ transform: [{ scale: scaleAnimDepot }] }}>
                  <PieChart
                    donut
                    radius={width * 0.35}
                    innerRadius={width * 0.22}
                    data={pieDataDepots}
                    focusOnPress
                    centerLabelComponent={() => {
                      if (
                        focusedDepotSlice !== null &&
                        statsAvecDepots[focusedDepotSlice]
                      ) {
                        const item = statsAvecDepots[focusedDepotSlice];
                        const percent =
                          totalPieDepots > 0
                            ? ((item.totalDepose / totalPieDepots) * 100).toFixed(1)
                            : 0;
                        return (
                          <View style={{ alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 24, marginBottom: 4 }}>🏦</Text>
                            <Text style={common.focusedCategory}>{item.description}</Text>
                            <Text style={styles.focusedPercentage}>{percent}%</Text>
                            <Text style={common.focusedAmount}>
                              +{item.totalDepose.toFixed(2)}€
                            </Text>
                          </View>
                        );
                      }
                      return (
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
                          <Text style={common.totalAmount}>
                            {totalDepose.toFixed(2)}€
                          </Text>
                          <Text style={common.totalLabel}>Déposé</Text>
                        </View>
                      );
                    }}
                  />
                </Animated.View>
              )}
            </View>

            <View style={common.legendWrapper}>
              {statsAvecDepots.map((item, index) => {
                const color = colorScale[index % colorScale.length];
                const percentValue =
                  totalPieDepots > 0
                    ? (item.totalDepose / totalPieDepots) * 100
                    : 0;
                const rounded = Math.round(percentValue * 10) / 10;
                const percent =
                  rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
                const isExpanded = expandedTirelire === item.tirelireId;

                return (
                  <View key={item.tirelireId}>
                    <TouchableOpacity
                      style={common.legendItem}
                      onPress={() =>
                        setExpandedTirelire(isExpanded ? null : item.tirelireId)
                      }
                    >
                      <View
                        style={[common.iconBox, { backgroundColor: `${color}15` }]}
                      >
                        <Text style={{ fontSize: 18 }}>🏦</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={common.catName}>{item.description}</Text>
                        <Text style={common.catPercent}>{percent}% des dépôts</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[common.catValue, styles.deposeValue]}>
                          +{item.totalDepose.toFixed(2)}€
                        </Text>
                        <View
                          style={[common.indicator, { backgroundColor: color }]}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && item.mouvements.length > 0 && (
                      <View style={styles.mouvementsList}>
                        {item.mouvements
                          .filter((m) => m.montant > 0)
                          .map((mouvement, idx) => (
                            <View
                              key={`${mouvement.id}-${idx}`}
                              style={styles.mouvementItem}
                            >
                              <View style={styles.mouvementInfo}>
                                <View style={styles.mouvementTypeRow}>
                                  <ArrowUp color="#2ecc71" size={14} />
                                  <Text
                                    style={[
                                      styles.mouvementType,
                                      styles.mouvementDepose,
                                    ]}
                                  >
                                    Dépôt
                                  </Text>
                                </View>
                                <Text style={styles.mouvementDate}>
                                  {dayjs(mouvement.date_mouvement).format(
                                    period === "annee" ? "MMM YYYY" : "DD/MM",
                                  )}
                                </Text>
                              </View>
                              <View style={styles.mouvementMontantContainer}>
                                <Text
                                  style={[
                                    styles.mouvementMontant,
                                    styles.mouvementDepose,
                                  ]}
                                >
                                  +{mouvement.montant.toFixed(2)}€
                                </Text>
                              </View>
                            </View>
                          ))}
                      </View>
                    )}
                  </View>
                );
              })}

              {!hasAnyMovement && (
                <Text style={common.emptyText}>
                  Aucun mouvement d'épargne sur cette période.
                </Text>
              )}
            </View>
          </>
        )}
      </View>

      {/* ════════════════ CARTE RETRAITS ════════════════ */}
      <View style={styles.chartCard}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsCollapsed(!isCollapsed)}
          style={styles.chartTitleContainer}
        >
          <View style={{ width: 20 }} />
          <View style={styles.titleWrapper}>
            <Text style={styles.chartTitle}>Retraits</Text>
            <View
              style={[styles.chartTitleUnderline, { backgroundColor: "#e74c3c" }]}
            />
          </View>
          {isCollapsed ? (
            <ChevronDown color="#2c3e50" size={28} />
          ) : (
            <ChevronUp color="#2c3e50" size={28} />
          )}
        </TouchableOpacity>

        {!isCollapsed && (
          <>
            <View style={common.chartWrapper}>
              {!hasAnyRetrait ? (
                <Text style={common.emptyText}>Aucun retrait sur cette période.</Text>
              ) : (
                <Animated.View style={{ transform: [{ scale: scaleAnimRetrait }] }}>
                  <PieChart
                    donut
                    radius={width * 0.35}
                    innerRadius={width * 0.22}
                    data={pieDataRetraits}
                    focusOnPress
                    centerLabelComponent={() => {
                      if (
                        focusedRetraitSlice !== null &&
                        statsAvecRetraits[focusedRetraitSlice]
                      ) {
                        const item = statsAvecRetraits[focusedRetraitSlice];
                        const percent =
                          totalPieRetraits > 0
                            ? ((item.totalRetire / totalPieRetraits) * 100).toFixed(1)
                            : 0;
                        return (
                          <View style={{ alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 24, marginBottom: 4 }}>🏦</Text>
                            <Text style={common.focusedCategory}>{item.description}</Text>
                            <Text
                              style={[styles.focusedPercentage, styles.retireValue]}
                            >
                              {percent}%
                            </Text>
                            <Text style={common.focusedAmount}>
                              -{item.totalRetire.toFixed(2)}€
                            </Text>
                          </View>
                        );
                      }
                      return (
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
                          <Text style={common.totalAmount}>
                            {totalRetire.toFixed(2)}€
                          </Text>
                          <Text style={common.totalLabel}>Retiré</Text>
                        </View>
                      );
                    }}
                  />
                </Animated.View>
              )}
            </View>

            <View style={common.legendWrapper}>
              {statsAvecRetraits.map((item, index) => {
                const color = colorScale[index % colorScale.length];
                const percentValue =
                  totalPieRetraits > 0
                    ? (item.totalRetire / totalPieRetraits) * 100
                    : 0;
                const rounded = Math.round(percentValue * 10) / 10;
                const percent =
                  rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
                const isExpanded = expandedTirelire === item.tirelireId;

                return (
                  <View key={item.tirelireId}>
                    <TouchableOpacity
                      style={common.legendItem}
                      onPress={() =>
                        setExpandedTirelire(isExpanded ? null : item.tirelireId)
                      }
                    >
                      <View
                        style={[common.iconBox, { backgroundColor: `${color}15` }]}
                      >
                        <Text style={{ fontSize: 18 }}>🏦</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={common.catName}>{item.description}</Text>
                        <Text style={common.catPercent}>{percent}% des retraits</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[common.catValue, styles.retireValue]}>
                          -{item.totalRetire.toFixed(2)}€
                        </Text>
                        <View
                          style={[common.indicator, { backgroundColor: color }]}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && item.mouvements.length > 0 && (
                      <View style={styles.mouvementsList}>
                        {item.mouvements
                          .filter((m) => m.montant < 0)
                          .map((mouvement, idx) => (
                            <View
                              key={`${mouvement.id}-${idx}`}
                              style={[
                                styles.mouvementItem,
                                styles.mouvementItemRetrait,
                              ]}
                            >
                              <View style={styles.mouvementInfo}>
                                <View style={styles.mouvementTypeRow}>
                                  <ArrowDown color="#e74c3c" size={14} />
                                  <Text
                                    style={[
                                      styles.mouvementType,
                                      styles.mouvementRetire,
                                    ]}
                                  >
                                    Retrait
                                  </Text>
                                </View>
                                <Text style={styles.mouvementDate}>
                                  {dayjs(mouvement.date_mouvement).format(
                                    period === "annee" ? "MMM YYYY" : "DD/MM",
                                  )}
                                </Text>
                              </View>
                              <View style={styles.mouvementMontantContainer}>
                                <Text
                                  style={[
                                    styles.mouvementMontant,
                                    styles.mouvementRetire,
                                  ]}
                                >
                                  {mouvement.montant.toFixed(2)}€
                                </Text>
                              </View>
                            </View>
                          ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
    </>
  );
};
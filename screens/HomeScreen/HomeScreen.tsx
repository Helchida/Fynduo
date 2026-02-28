import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/types";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./HomeScreen.style";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { switchActiveHousehold } from "services/supabase/db";
import {
  LogOut,
  User,
  Settings,
  PlusCircle,
  Home,
  Users,
} from "lucide-react-native";
import { useToast } from "hooks/useToast";
import { supabase } from "services/supabase/config";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const HistogramPlaceholder = ({
  month,
  year,
  total,
  totalRevenus,
  maxTotal,
  isSoloMode,
  isStacked,
}: {
  month: string;
  year: string;
  total: number;
  totalRevenus: number;
  maxTotal: number;
  isSoloMode: boolean;
  isStacked: boolean;
}) => {
  const MAX_BAR_HEIGHT = 90;
  const depenseHeight = maxTotal > 0 ? (total / maxTotal) * MAX_BAR_HEIGHT : 0;
  const revenuHeight =
    maxTotal > 0 ? (totalRevenus / maxTotal) * MAX_BAR_HEIGHT : 0;

  const solde = totalRevenus - total;
  const soldeColor = solde > 0 ? "#27ae60" : solde < 0 ? "#e74c3c" : "#95a5a6";

  return (
    <View style={styles.historyColumn}>
      {isStacked && isSoloMode ? (
        <>
          <View
            style={{
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <Text
              style={{ color: soldeColor, fontSize: 11, fontWeight: "900" }}
            >
              {solde >= 0 ? "+" : ""}
              {solde.toFixed(2)}€
            </Text>
          </View>

          <View
            style={{
              height: MAX_BAR_HEIGHT,
              width: 25,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(revenuHeight, 2),
                  backgroundColor: "#27a1d1",
                  width: 25,
                  opacity: 0.2,
                  position: "absolute",
                },
              ]}
            />
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(depenseHeight, 2),
                  backgroundColor: soldeColor,
                  width: 25,
                  opacity: 0.8,
                },
              ]}
            />
          </View>
        </>
      ) : (
        <View style={{ alignItems: "center" }}>
          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}
          >
            {isSoloMode && (
              <View style={{ alignItems: "flex-end", width: 40 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: "#27a1d1",
                    fontSize: 9,
                    fontWeight: "800",
                    textAlign: "right",
                    minWidth: 65,
                    marginBottom: 4,
                    letterSpacing: -0.5
                  }}
                >
                  {totalRevenus > 0 ? `${totalRevenus.toFixed(1)}€` : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(revenuHeight, 2),
                      backgroundColor: "#27a1d1",
                      width: 20,
                    },
                  ]}
                />
              </View>
            )}

            <View style={{ alignItems: "flex-start", width: 40 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: "#27ae60",
                  fontSize: 9,
                  fontWeight: "800",
                  textAlign: "left",
                  minWidth: 65,
                  marginBottom: 4,
                  letterSpacing: -0.5
                }}
              >
                {total > 0 ? `${total.toFixed(1)}€` : ""}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(depenseHeight, 2),
                    backgroundColor: "#27ae60",
                    width: 20,
                  },
                ]}
              />
            </View>
          </View>
          {isSoloMode && (
            <View
              style={{
                width: 44,
                height: 2,
                backgroundColor: "#bdc3c7",
                marginTop: 6,
                borderRadius: 1,
              }}
            />
          )}
        </View>
      )}

      <Text style={[styles.historyMonthLabel, { marginTop: 8 }]}>{month}</Text>
      <Text style={styles.historyYearLabel}>{year}</Text>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const toast = useToast();
  const { user, logout, isLoading, householdUsers } = useAuth();
  const [householdsDetails, setHouseholdsDetails] = useState<
    Record<string, { name: string; count: number }>
  >({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [householdMenuVisible, setHouseholdMenuVisible] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [isStackedView, setIsStackedView] = useState(false);

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  useEffect(() => {
    if (!user?.households) return;

    const channels: any[] = [];

    const loadHouseholds = async () => {
      for (const hId of user.households) {
        if (hId === user.id) {
          setHouseholdsDetails((prev) => ({
            ...prev,
            [hId]: { name: "Mon Foyer Solo", count: 1 },
          }));
        } else {
          const { data, error } = await supabase
            .from("households")
            .select("*")
            .eq("id", hId)
            .single();

          if (data && !error) {
            setHouseholdsDetails((prev) => ({
              ...prev,
              [hId]: {
                name: data.name || `Foyer (${hId.substring(0, 4)})`,
                count: data.members?.length || 0,
              },
            }));

            const channel = supabase
              .channel(`household:${hId}`)
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "households",
                  filter: `id=eq.${hId}`,
                },
                (payload) => {
                  const newData = payload.new as any;
                  if (newData) {
                    setHouseholdsDetails((prev) => ({
                      ...prev,
                      [hId]: {
                        name: newData.name || `Foyer (${hId.substring(0, 4)})`,
                        count: newData.members?.length || 0,
                      },
                    }));
                  }
                },
              )
              .subscribe();

            channels.push(channel);
          } else {
            console.error(`Erreur foyer ${hId}:`, error);
          }
        }
      }
    };

    loadHouseholds();
    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [user?.households]);

  const { isLoadingComptes, currentMonthData, charges, revenus } = useComptes();

  const { monthsData, canGoNext, canGoPrevious } = useMemo(() => {
    if (!charges)
      return { monthsData: [], canGoNext: false, canGoPrevious: false };

    const isSoloMode = user.activeHouseholdId === user.id;

    const allMonthsSet = new Set<string>();
    charges.forEach((c) => {
      if (c.type === "variable" && c.categorie === "cat_remboursement") return;
      allMonthsSet.add(dayjs(c.dateStatistiques).format("YYYY-MM"));
    });
    revenus.forEach((r) =>
      allMonthsSet.add(dayjs(r.dateReception).format("YYYY-MM")),
    );

    const sortedMonths = Array.from(allMonthsSet).sort((a, b) =>
      b.localeCompare(a),
    );
    const startIndex = Math.abs(monthOffset);
    const displayMonths = sortedMonths.slice(startIndex, startIndex + 3);

    const monthsData = displayMonths.reverse().map((monthKey) => {
      const monthCharges = charges.filter(
        (c) => dayjs(c.dateStatistiques).format("YYYY-MM") === monthKey,
      );
      let totalDépenses = 0;
      monthCharges.forEach((c) => {
        const montant = Number(c.montantTotal) || 0;
        if (isSoloMode && c.beneficiaires?.length > 0) {
          if (c.beneficiaires.includes(user.id))
            totalDépenses += montant / c.beneficiaires.length;
        } else {
          totalDépenses += montant;
        }
      });

      const monthRevenus = revenus.filter(
        (r) => dayjs(r.dateReception).format("YYYY-MM") === monthKey,
      );
      let totalRevenus = 0;
      monthRevenus.forEach((r) => {
        totalRevenus += Number(r.montant) || 0;
      });

      const monthDate = dayjs(monthKey);
      return {
        month:
          monthDate.format("MMM").charAt(0).toUpperCase() +
          monthDate.format("MMM").slice(1),
        year: monthDate.format("YYYY"),
        total: totalDépenses,
        totalRevenus,
        fullDate: monthKey,
      };
    });

    return {
      monthsData,
      canGoPrevious: startIndex + 3 < sortedMonths.length,
      canGoNext: monthOffset < 0,
    };
  }, [charges, revenus, user, monthOffset]);

  const maxTotal = useMemo(() => {
    return Math.max(
      ...monthsData.map((d) => Math.max(d.total, d.totalRevenus)),
      1,
    );
  }, [monthsData]);

  if (isLoadingComptes || isLoading) {
    return <Text style={styles.loading}>Chargement...</Text>;
  }

  const handleSwitchHousehold = async (hId: string) => {
    if (user.activeHouseholdId === hId) return;

    try {
      await switchActiveHousehold(user.id, hId);
      window.location.reload();
    } catch (error) {
      alert("Erreur lors du changement de foyer");
    }
  };

  const isFinalized = currentMonthData?.statut === "finalisé";
  const isSolo = user.activeHouseholdId === user.id;

  const sortedHouseholds = [...(user.households || [])].sort((a, b) => {
    if (a === user.id) return -1;
    if (b === user.id) return 1;
    return a.localeCompare(b);
  });

  return (
    <>
      <View style={styles.mainView}>
        <View style={styles.headerContainer}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>
              Bonjour, {user.displayName} 👋
            </Text>

            <TouchableOpacity
              style={[
                styles.badge,
                isSolo ? styles.badgeSolo : styles.badgeShared,
              ]}
              onPress={() => setHouseholdMenuVisible(true)}
            >
              <Text
                style={[
                  styles.badgeText,
                  isSolo ? styles.badgeTextSolo : styles.badgeTextShared,
                ]}
              >
                {isSolo
                  ? "Mon Foyer Solo"
                  : `${householdsDetails[user.activeHouseholdId]?.name || "Chargement..."} (${
                      householdsDetails[user.activeHouseholdId]?.count ?? "..."
                    })`}{" "}
                ▾
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.userIconButton}
            onPress={() => setMenuVisible(true)}
          >
            <User color="#2c3e50" size={22} />
          </TouchableOpacity>
        </View>
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate("UserSettings");
                  }}
                >
                  <Settings color="#2c3e50" size={18} />
                  <Text style={styles.menuItemText}>Paramètres</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    logout!();
                  }}
                >
                  <LogOut color="#e74c3c" size={18} />
                  <Text style={[styles.menuItemText, { color: "#e74c3c" }]}>
                    Déconnexion
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitleHeader}>
                {isSolo ? "Historique" : "Total dépenses"}
              </Text>

              {isSolo && (
                <View style={styles.switchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      !isStackedView && styles.switchButtonActive,
                    ]}
                    onPress={() => setIsStackedView(false)}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        !isStackedView && styles.switchTextActive,
                      ]}
                    >
                      FLUX
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      isStackedView && styles.switchButtonActive,
                    ]}
                    onPress={() => setIsStackedView(true)}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        isStackedView && styles.switchTextActive,
                      ]}
                    >
                      SOLDE
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.historyNavigator}>
              <TouchableOpacity
                style={[
                  styles.navArrow,
                  !canGoPrevious && styles.navArrowDisabled,
                ]}
                onPress={() => canGoPrevious && setMonthOffset(monthOffset - 3)}
                disabled={!canGoPrevious}
              >
                <Text
                  style={[
                    styles.navArrowText,
                    !canGoPrevious && styles.navArrowTextDisabled,
                  ]}
                >
                  {"<"}
                </Text>
              </TouchableOpacity>

              <View style={styles.chartArea}>
                {monthsData.map((data, index) => (
                  <HistogramPlaceholder
                    key={`${data.fullDate}-${index}`}
                    month={data.month}
                    year={data.year}
                    total={data.total}
                    totalRevenus={data.totalRevenus}
                    maxTotal={maxTotal}
                    isSoloMode={isSolo}
                    isStacked={isStackedView}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.navArrow, !canGoNext && styles.navArrowDisabled]}
                onPress={() => canGoNext && setMonthOffset(monthOffset + 3)}
                disabled={!canGoNext}
              >
                <Text
                  style={[
                    styles.navArrowText,
                    !canGoNext && styles.navArrowTextDisabled,
                  ]}
                >
                  {">"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isSolo ||
          (householdsDetails[user.activeHouseholdId]?.count ?? 0) <= 1 ? (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#27a1d1ff" }]}
                onPress={() => navigation.navigate("Revenus")}
              >
                <Text style={styles.actionText}>Revenus</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#2ecc71" }]}
                onPress={() => navigation.navigate("Charges")}
              >
                <Text style={styles.actionText}>Dépenses</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#d14127ff" }]}
                onPress={() => navigation.navigate("ChargesFixes")}
              >
                <Text style={styles.actionText}>Charges fixes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#9b59b6" }]}
                onPress={() => navigation.navigate("Stats")}
              >
                <Text style={styles.actionText}>Statistiques</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#f39c12" }]}
                onPress={() => navigation.navigate("Regulation")}
              >
                <Text style={styles.actionText}>
                  {isFinalized ? "Voir le bilan du mois" : "Faire les comptes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#27a1d1ff" }]}
                onPress={() => navigation.navigate("Loyer")}
              >
                <Text style={styles.actionText}>Loyer et APL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#d14127ff" }]}
                onPress={() => navigation.navigate("ChargesFixes")}
              >
                <Text style={styles.actionText}>Charges fixes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#2ecc71" }]}
                onPress={() => navigation.navigate("Charges")}
              >
                <Text style={styles.actionText}>Dépenses</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#9b59b6" }]}
                onPress={() => navigation.navigate("Stats")}
              >
                <Text style={styles.actionText}>Statistiques</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#34495e" }]}
                onPress={() => navigation.navigate("History")}
              >
                <Text style={styles.actionText}>Historique</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={householdMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setHouseholdMenuVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setHouseholdMenuVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.householdMenuDropdown}>
                <Text style={styles.householdMenuTitle}>Mes Espaces</Text>

                {sortedHouseholds.map((hId) => {
                  const isSoloItem = hId === user.id;
                  const isActive = hId === user.activeHouseholdId;
                  const details = householdsDetails[hId];

                  return (
                    <TouchableOpacity
                      key={hId}
                      style={[
                        styles.householdItem,
                        isActive && styles.activeHouseholdItem,
                      ]}
                      onPress={() => handleSwitchHousehold(hId)}
                    >
                      {isSoloItem ? (
                        <Home
                          size={18}
                          color={isActive ? "#3498db" : "#2c3e50"}
                        />
                      ) : (
                        <Users
                          size={18}
                          color={isActive ? "#3498db" : "#2c3e50"}
                        />
                      )}

                      <Text
                        style={[
                          styles.householdItemText,
                          isActive && styles.activeHouseholdText,
                        ]}
                      >
                        {details?.name ||
                          (isSoloItem ? "Mon Foyer Solo" : "Chargement...")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.addHouseholdItem}
                  onPress={() => {
                    setHouseholdMenuVisible(false);
                    navigation.navigate("Households");
                  }}
                >
                  <PlusCircle size={18} color="#3498db" />
                  <Text style={styles.addHouseholdText}>Gérer les foyers</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </>
  );
};

export default HomeScreen;

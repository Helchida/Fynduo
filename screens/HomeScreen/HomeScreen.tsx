import React, { useEffect, useState } from "react";
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
import { switchActiveHousehold } from "services/firebase/db";
import {
  LogOut,
  User,
  Settings,
  PlusCircle,
  Home,
  Users,
} from "lucide-react-native";
import { useToast } from "hooks/useToast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "services/firebase/config";

const MOCK_HISTORY = [
  { month: "Sept", total: 1250.0 },
  { month: "Oct", total: 1180.5 },
  { month: "Nov", total: 1320.8 },
];

const HistogramPlaceholder = ({
  month,
  total,
}: {
  month: string;
  total: number;
}) => {
  const MAX_TOTAL = 1500;
  const MAX_BAR_HEIGHT = 120;
  const barHeight = (total / MAX_TOTAL) * MAX_BAR_HEIGHT;

  return (
    <View style={styles.historyColumn}>
      <Text style={styles.historyTotalLabel}>{total.toFixed(0)}€</Text>
      <View style={[styles.bar, { height: barHeight }]} />
      <Text style={styles.historyMonthLabel}>{month}</Text>
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

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  useEffect(() => {
    if (!user?.households) return;

    const unsubscribes: (() => void)[] = [];

    user.households.forEach((hId) => {
      if (hId === user.id) {
        setHouseholdsDetails((prev) => ({
          ...prev,
          [hId]: { name: "Mon Foyer Solo", count: 1 },
        }));
      } else {
        const householdRef = doc(db, "households", hId);
        const unsubscribe = onSnapshot(
          householdRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setHouseholdsDetails((prev) => ({
                ...prev,
                [hId]: {
                  name: data.name || `Foyer (${hId.substring(0, 4)})`,
                  count: data.members?.length || 0,
                },
              }));
            }
          },
          (error) => console.error(`Erreur foyer ${hId}:`, error),
        );
        unsubscribes.push(unsubscribe);
      }
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user?.households]);

  const { isLoadingComptes, currentMonthData } = useComptes();

  if (isLoadingComptes || isLoading) {
    return <Text style={styles.loading}>Chargement...</Text>;
  }

  const handleSwitchHousehold = async (targetId: string) => {
    if (!user || user.activeHouseholdId === targetId) return;

    try {
      await switchActiveHousehold(user.id, targetId);
      setHouseholdMenuVisible(false);
      toast.success("Foyer changé");
    } catch (error) {
      toast.error("Erreur", "Impossible de changer de foyer");
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
            <Text style={styles.sectionTitle}>Total des dépenses</Text>

            <View style={styles.historyNavigator}>
              <TouchableOpacity
                style={styles.navArrow}
                onPress={() =>
                  toast.info("Info", "Navigation des mois à venir !")
                }
              >
                <Text style={styles.navArrowText}>{"<"}</Text>
              </TouchableOpacity>

              <View style={styles.chartArea}>
                {MOCK_HISTORY.map((data, index) => (
                  <HistogramPlaceholder key={index} {...data} />
                ))}
              </View>

              <TouchableOpacity
                style={styles.navArrow}
                onPress={() =>
                  toast.info("Info", "Navigation des mois à venir !")
                }
              >
                <Text style={styles.navArrowText}>{">"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isSolo ||
          (householdsDetails[user.activeHouseholdId]?.count ?? 0) <= 1 ? (
            <View style={styles.soloInfoCard}>
              {isSolo ? (
                <>
                  <Text style={styles.soloTitle}>Mode Solo actif</Text>
                  <Text style={styles.soloDescription}>
                    Les fonctionnalités de gestion de foyer (partage des
                    charges, régularisation) seront disponibles dès que vous
                    rejoindrez ou créerez un foyer partagé.
                  </Text>
                  <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => navigation.navigate("Households")}
                  >
                    <Text style={styles.inviteButtonText}>
                      Gérer mes foyers
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.soloTitle}>Invitez des personnes</Text>
                  <Text style={styles.soloDescription}>
                    Les fonctionnalités de gestion de foyer (partage des
                    charges, régularisation) seront disponibles dès que vous
                    serez plusieurs dans le foyer partagé. Partagez le code
                    d'accès à votre foyer depuis l'écran de gestion des foyers.
                  </Text>
                  <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => navigation.navigate("Households")}
                  >
                    <Text style={styles.inviteButtonText}>
                      Gérer mes foyers
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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
                onPress={() => navigation.navigate("ChargesVariables")}
              >
                <Text style={styles.actionText}>Charges variables</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderLeftColor: "#9b59b6" }]}
                onPress={() =>
                  toast.info("Info", "Fonctionnalité de statistiques à venir !")
                }
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

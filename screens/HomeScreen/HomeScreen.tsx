import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useNavigation } from "@react-navigation/native";
import { IUser, RootStackNavigationProp } from "@/types";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./HomeScreen.style";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { getHouseholdUsers } from "services/firebase/db";
import { LogOut, User, Settings } from "lucide-react-native";

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
  const { user, logout, isLoading } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const [householdMembers, setHouseholdMembers] = useState<IUser[]>([]);

  useEffect(() => {
    if (user?.householdId) {
      getHouseholdUsers(user.householdId)
        .then(setHouseholdMembers)
        .catch((err) => console.error("Erreur membres foyer:", err));
    }
  }, [user?.householdId]);

  const { isLoadingComptes } = useComptes();

  if (isLoadingComptes || isLoading) {
    return <Text style={styles.loading}>Chargement...</Text>;
  }

  const isSolo = householdMembers.length <= 1;

  return (
    <View style={styles.mainView}>
      <View style={styles.headerContainer}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Bonjour, {user.displayName} 👋</Text>
          <View
            style={[
              styles.badge,
              isSolo ? styles.badgeSolo : styles.badgeShared,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isSolo ? styles.badgeTextSolo : styles.badgeTextShared,
              ]}
            >
              {isSolo
                ? "Mode Solo"
                : `Foyer Partagé (${householdMembers.length})`}
            </Text>
          </View>
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
                  Alert.alert("Paramètres", "Bientôt disponible !");
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Total des dépenses</Text>

          <View style={styles.historyNavigator}>
            <TouchableOpacity
              style={styles.navArrow}
              onPress={() =>
                Alert.alert("Navigation", "Afficher les 3 mois précédents")
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
                Alert.alert("Navigation", "Afficher les 3 mois suivants")
              }
            >
              <Text style={styles.navArrowText}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isSolo ? (
          <View style={styles.soloInfoCard}>
            <Text style={styles.soloTitle}>Mode Solo actif</Text>
            <Text style={styles.soloDescription}>
              Les fonctionnalités de gestion de foyer (partage des charges,
              régularisation) seront disponibles dès que vous rejoindrez ou
              créerez un foyer partagé.
            </Text>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() =>
                Alert.alert(
                  "Prochainement",
                  "Vous pourrez bientôt inviter un partenaire !"
                )
              }
            >
              <Text style={styles.inviteButtonText}>Inviter un partenaire</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { borderLeftColor: "#f39c12" }]}
              onPress={() => navigation.navigate("Regulation")}
            >
              <Text style={styles.actionText}>Faire les comptes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderLeftColor: "#2ecc71" }]}
              onPress={() => navigation.navigate("ChargesVariables")}
            >
              <Text style={styles.actionText}>Charges variables</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderLeftColor: "#d14127ff" }]}
              onPress={() => navigation.navigate("ChargesFixes")}
            >
              <Text style={styles.actionText}>Charges fixes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderLeftColor: "#27a1d1ff" }]}
              onPress={() => navigation.navigate("Loyer")}
            >
              <Text style={styles.actionText}>Loyer et APL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderLeftColor: "#9b59b6" }]}
              onPress={() =>
                Alert.alert("Statistiques", "Fonctionnalité de stats à venir.")
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
    </View>
  );
};

export default HomeScreen;

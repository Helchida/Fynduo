import React, { useEffect, ComponentType } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "@/types";
import { TouchableOpacity, Text } from "react-native";
import linking from "./linking";
import { styles } from "../styles/screens/ChargesScreen/ChargesScreen.style";

import HomeScreen from "../screens/HomeScreen/HomeScreen";
import LoyerScreen from "../screens/LoyerScreen/LoyerScreen";
import ChargesFixesScreen from "../screens/ChargesFixesScreen/ChargesFixesScreen";
import ChargesScreen from "../screens/ChargesScreen/ChargesScreen";
import RevenusScreen from "../screens/RevenusScreen/RevenusScreen";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import Regulation from "../screens/RegulationScreen/RegulationScreen";
import SummaryRegulationScreen from "../screens/SummaryRegulationScreen/SummaryRegulationScreen";
import HistoryScreen from "../screens/HistoryScreen/HistoryScreen";
import HistoryDetailScreen from "../screens/HistoryDetailScreen/HistoryDetailScreen";
import { ChevronLeft } from "lucide-react-native";
import RegisterScreen from "screens/RegisterScreen/RegisterScreen";
import { navigationRef } from "./RootNavigation";
import EmailVerificationScreen from "screens/EmailVerificationScreen/EmailVerificationScreen";
import UserSettingsScreen from "../screens/UserSettingsScreen/UserSettingsScreen";
import HouseholdsScreen from "../screens/HouseholdsScreen/HouseholdsScreen";
import StatsScreen from "screens/StatsScreen/StatsScreen";
import EpargneScreen from "screens/EpargneScreen/EpargneScreen";
import ChargeDetailScreen from "screens/ChargeDetail/ChargeDetailScreen";
import RevenuDetailScreen from "screens/RevenuDetail/RevenuDetailScreen";
import TirelireScreen from "screens/EpargneScreen/TirelireScreen/TirelireScreen";
import NotificationsScreen from "screens/NotificationsScreen/NotificationsScreen";
import BudgetsScreen from "screens/BudgetsScreen/BudgetsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
type HouseholdAccess = "solo" | "shared" | "both";

const AppStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: "#f4f7f9",
      },
      headerTitleStyle: {
        fontWeight: "600",
        fontSize: 17,
        color: "#1a1a1a",
      },
      headerLeft: () => {
        const canGoBack = navigation.canGoBack();
        if (!canGoBack) {
          return null;
        }

        return (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft color="#2c3e50" size={28} />
          </TouchableOpacity>
        );
      },
      headerTitleAlign: "center",
    })}
  >
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: "Accueil" }}
    />
    <Stack.Screen
      name="UserSettings"
      component={UserSettingsScreen}
      options={{ title: "Paramètres" }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: "Notifications" }}
    />
    <Stack.Screen
      name="Households"
      component={HouseholdsScreen}
      options={{ title: "Mes Foyers" }}
    />
    <Stack.Screen
      name="Loyer"
      component={LoyerScreenGuarded}
      options={{ title: "Loyer et APL" }}
    />
    <Stack.Screen
      name="ChargesFixes"
      component={ChargesFixesScreenGuarded}
      options={{ title: "Charges Fixes" }}
    />
    <Stack.Screen
      name="Charges"
      component={ChargesScreenGuarded}
      options={{ title: "Charges" }}
    />
    <Stack.Screen
      name="ChargeDetail"
      component={ChargeDetailScreenGuarded}
      options={({ route }) => ({
        title: `Détail de ${route.params.description}`,
      })}
    />
    <Stack.Screen
      name="RevenuDetail"
      component={RevenuDetailScreenGuarded}
      options={({ route }) => ({
        title: `Détail de ${route.params.description}`,
      })}
    />
    <Stack.Screen
      name="Regulation"
      component={RegulationScreenGuarded}
      options={{ title: "Faire les Comptes" }}
    />
    <Stack.Screen
      name="SummaryRegulation"
      component={SummaryRegulationScreenGuarded}
      options={{ title: "Résumé du règlement" }}
    />
    <Stack.Screen
      name="History"
      component={HistoryScreenGuarded}
      options={{ title: "Historique des Comptes" }}
    />
    <Stack.Screen
      name="HistoryDetail"
      component={HistoryDetailScreenGuarded}
      options={({ route }) => ({
        title: `Détail de ${route.params.moisAnnee}`,
      })}
    />
    <Stack.Screen
      name="Stats"
      component={StatsScreenGuarded}
      options={{ title: "Statistiques" }}
    />
    <Stack.Screen
      name="Revenus"
      component={RevenusScreenGuarded}
      options={{ title: "Revenus" }}
    />
    <Stack.Screen
      name="Epargne"
      component={EpargneScreenGuarded}
      options={{ title: "Epargne" }}
    />
    <Stack.Screen
      name="Budgets"
      component={BudgetsScreenGuarded}
      options={{ title: "Budgets" }}
    />
    <Stack.Screen
      name="Tirelire"
      component={TirelireScreenGuarded}
      options={({ route }) => ({
        title: `Détail de ${route.params.tirelire.description}`,
      })}
    />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const VerificationStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="EmailVerification"
      component={EmailVerificationScreen}
      options={{ title: "Vérification par email" }}
    />
  </Stack.Navigator>
);

const withHouseholdAccess = (
  Screen: ComponentType<any>,
  access: HouseholdAccess,
) => {
  const GuardedScreen = (props: any) => {
    const { user, isLoading } = useAuth();

    const isSolo = user ? user.activeHouseholdId === user.id : false;

    const isAllowed =
      access === "both" ||
      (access === "solo" && isSolo) ||
      (access === "shared" && !isSolo && !!user);

    useEffect(() => {
      if (!isLoading && user && !isAllowed) {
        props.navigation.reset({
          index: 0,
          routes: [{ name: "Home" as keyof RootStackParamList }],
        });
      }
    }, [isLoading, user, isAllowed, props.navigation]);

    if (isLoading || !isAllowed) {
      return null;
    }

    return <Screen {...props} />;
  };

  GuardedScreen.displayName = `withHouseholdAccess(${
    Screen.displayName || Screen.name || "Screen"
  })`;

  return GuardedScreen;
};

const ChargesScreenGuarded = withHouseholdAccess(ChargesScreen, "both");
const ChargesFixesScreenGuarded = withHouseholdAccess(
  ChargesFixesScreen,
  "both",
);

const LoyerScreenGuarded = withHouseholdAccess(LoyerScreen, "shared");
const RevenusScreenGuarded = withHouseholdAccess(RevenusScreen, "solo");
const EpargneScreenGuarded = withHouseholdAccess(EpargneScreen, "solo");
const BudgetsScreenGuarded = withHouseholdAccess(BudgetsScreen, "solo");

const StatsScreenGuarded = withHouseholdAccess(StatsScreen, "both");
const RegulationScreenGuarded = withHouseholdAccess(Regulation, "shared");
const SummaryRegulationScreenGuarded = withHouseholdAccess(
  SummaryRegulationScreen,
  "shared",
);

const HistoryScreenGuarded = withHouseholdAccess(HistoryScreen, "shared");
const HistoryDetailScreenGuarded = withHouseholdAccess(
  HistoryDetailScreen,
  "shared",
);

const ChargeDetailScreenGuarded = withHouseholdAccess(
  ChargeDetailScreen,
  "both",
);

const RevenuDetailScreenGuarded = withHouseholdAccess(
  RevenuDetailScreen,
  "solo",
);

const TirelireScreenGuarded = withHouseholdAccess(TirelireScreen, "solo");

const RootNavigator = () => {
  const { user, isAwaitingVerification, isLoading } = useAuth();

  if (isLoading) {
    return <Text style={styles.loading}>Chargement...</Text>;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      {user ? (
        <AppStack />
      ) : isAwaitingVerification ? (
        <VerificationStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;

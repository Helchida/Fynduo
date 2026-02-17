import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "@/types";
import { TouchableOpacity } from "react-native";

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
import ChargeDetailScreen from "screens/ChargeDetail/ChargeDetailScreen";
import RevenuDetailScreen from "screens/RevenuDetail/RevenuDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      name="Households"
      component={HouseholdsScreen}
      options={{ title: "Mes Foyers" }}
    />
    <Stack.Screen
      name="Loyer"
      component={LoyerScreen}
      options={{ title: "Loyer et APL" }}
    />
    <Stack.Screen
      name="ChargesFixes"
      component={ChargesFixesScreen}
      options={{ title: "Charges Fixes" }}
    />
    <Stack.Screen
      name="Charges"
      component={ChargesScreen}
      options={{ title: "Charges" }}
    />
    <Stack.Screen
      name="ChargeDetail"
      component={ChargeDetailScreen}
      options={({ route }) => ({
        title: `Détail de ${route.params.description}`,
      })}
    />
    <Stack.Screen
      name="RevenuDetail"
      component={RevenuDetailScreen}
      options={({ route }) => ({
        title: `Détail de ${route.params.description}`,
      })}
    />
    <Stack.Screen
      name="Regulation"
      component={Regulation}
      options={{ title: "Faire les Comptes" }}
    />
    <Stack.Screen
      name="SummaryRegulation"
      component={SummaryRegulationScreen}
      options={{ title: "Résumé du règlement" }}
    />
    <Stack.Screen
      name="History"
      component={HistoryScreen}
      options={{ title: "Historique des Comptes" }}
    />
    <Stack.Screen
      name="HistoryDetail"
      component={HistoryDetailScreen}
      options={({ route }) => ({
        title: `Détail de ${route.params.moisAnnee}`,
      })}
    />
    <Stack.Screen
      name="Stats"
      component={StatsScreen}
      options={{ title: "Statistiques" }}
    />
    <Stack.Screen
      name="Revenus"
      component={RevenusScreen}
      options={{ title: "Revenus" }}
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

const RootNavigator = () => {
  const { user, isAwaitingVerification } = useAuth();

  return (
    <NavigationContainer ref={navigationRef}>
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

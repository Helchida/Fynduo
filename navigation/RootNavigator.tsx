import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "../types";

import HomeScreen from "../screens/HomeScreen/HomeScreen";
import LoyerScreen from "../screens/LoyerScreen/LoyerScreen";
import ChargesFixesScreen from "../screens/ChargesFixesScreen/ChargesFixesScreen";
import ChargesVariablesScreen from "../screens/ChargesVariablesScreen/ChargesVariablesScreen";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import Regulation from "../screens/RegulationScreen/RegulationScreen";
import SummaryRegulationScreen from "../screens/SummaryRegulationScreen/SummaryRegulationScreen";
import HistoryScreen from "../screens/HistoryScreen/HistoryScreen";
import HistoryDetailScreen from "../screens/HistoryDetailScreen/HistoryDetailScreen";
import ChargeVariableDetailScreen from "screens/ChargeVariableDetail/ChargeVariableDetailScreen";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import RegisterScreen from "screens/RegisterScreen/RegisterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <ChevronLeft color="#007AFF" size={24} />
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: "Accueil" }}
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
      name="ChargesVariables"
      component={ChargesVariablesScreen}
      options={{ title: "Charges Variables" }}
    />
    <Stack.Screen
      name="ChargeVariableDetail"
      component={ChargeVariableDetailScreen}
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
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;

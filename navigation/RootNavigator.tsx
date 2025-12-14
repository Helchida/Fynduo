import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen/HomeScreen';
import LoyerScreen from '../screens/LoyerScreen/LoyerScreen';
import ChargesFixesScreen from '../screens/ChargesFixesScreen/ChargesFixesScreen';
import ChargesVariablesScreen from '../screens/ChargesVariablesScreen/ChargesVariablesScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import Regulation from '../screens/RegulationScreen/RegulationScreen';
import SummaryRegulationScreen from '../screens/SummaryRegulationScreen/SummaryRegulationScreen';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen/HistoryDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
        <Stack.Screen name="Loyer" component={LoyerScreen} options={{ title: 'Loyer et APL' }} />
        <Stack.Screen name="ChargesFixes" component={ChargesFixesScreen} options={{ title: 'Charges Fixes' }} />
        <Stack.Screen name="ChargesVariables" component={ChargesVariablesScreen} options={{ title: 'Charges Variables' }} />
        <Stack.Screen name="Regulation" component={Regulation} options={{ title: 'Faire les Comptes' }} />
        <Stack.Screen 
                name="SummaryRegulation" 
                component={SummaryRegulationScreen} 
                options={{ title: 'Résumé du règlement' }} 
            />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique des Comptes' }} />
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={({ route }) => ({ 
            title: `Détail de ${route.params.moisAnnee}` 
        })} />
    </Stack.Navigator>
);

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} /> 
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
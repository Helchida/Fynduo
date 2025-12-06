import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import LoyerScreen from '../screens/LoyerScreen';
import ChargesFixesScreen from '../screens/ChargesFixesScreen';
import ChargesVariablesScreen from '../screens/ChargesVariablesScreen';
import LoginScreen from '../screens/LoginScreen';
import Regulation from '../screens/RegulationScreen';
import SummaryRegulationScreen from '../screens/SummaryRegulationScreen';

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
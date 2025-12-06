import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import LoyerScreen from '../screens/LoyerScreen';
import ChargesScreen from '../screens/ChargesScreen';
import TresorerieScreen from '../screens/TresorerieScreen';
import LoginScreen from '../screens/LoginScreen';
import ReglementScreen from '../screens/ReglementScreen';
import RecapScreen from '../screens/RecapScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'FYNDUO Dashboard' }} />
        <Stack.Screen name="Loyer" component={LoyerScreen} options={{ title: 'Gestion du Loyer' }} />
        <Stack.Screen name="ChargesFixes" component={ChargesScreen} options={{ title: 'Charges Fixes' }} />
        <Stack.Screen name="ChargesVariables" component={TresorerieScreen} options={{ title: 'Charges Variables' }} />
        <Stack.Screen name="Reglement" component={ReglementScreen} options={{ title: 'Faire les Comptes' }} />
        <Stack.Screen 
                name="Recap" 
                component={RecapScreen} 
                options={{ title: 'Récapitulatif Mensuel' }} 
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
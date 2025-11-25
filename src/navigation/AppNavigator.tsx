import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import UpdateExpenseScreen from '../screens/UpdateExpenseScreen';

const Stack = createNativeStackNavigator<RootStackParamList>(); 

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Fynduo' }}
        />
        <Stack.Screen 
          name="AddExpense" 
          component={AddExpenseScreen}
          options={{ title: 'Ajouter une dépense' }}
        />
        <Stack.Screen 
          name="UpdateExpense" 
          component={UpdateExpenseScreen}
          options={{ title: 'Modifier/Supprimer une dépense' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from '../styles/HomeScreen.styles';
import ExpenseItem from '../components/ExpenseItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Expense } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', label: 'Café', category: 'Courses' , amount: 45.72 },
    { id: '2', label: 'Cinéma', category: 'Loisirs', amount: 3.5 },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes dépenses</Text>
      <Text style={{ marginBottom: 20, color: '#555' }}>
        Suivez vos dépenses partagées avec votre partenaire en temps réel.
      </Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem expense={item} />
        )}
        style={styles.list}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddExpense', {
            addExpense: (expense: Expense) =>
              setExpenses((prev) => [...prev, expense]),
          })
        }
      >
        <Text style={styles.addButtonText}>Ajouter une dépense</Text>
      </TouchableOpacity>
    </View>
  );
}

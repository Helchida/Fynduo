import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import styles from '../styles/AddExpenseScreen.styles';
import { Expense } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateExpense'>;

export default function UpdateExpenseScreen({ navigation, route }: Props) {
  const { expense, updateExpense, removeExpense } = route.params;

  const [label, setLabel] = useState(expense.label);
  const [category, setCategory] = useState(expense.category);
  const [amount, setAmount] = useState(expense.amount.toString());

  const handleSave = () => {
    if (!label && !amount && !category) return;

    const parsedAmount = Number(amount.replace(',', '.'));
    if (isNaN(parsedAmount)) return;

    const updated: Expense = {
      id: expense.id,
      label,
      category,
      amount: parsedAmount,
    };

    updateExpense(updated);
    navigation.goBack();
  };

  const handleRemove = () => {
    if (removeExpense) removeExpense(expense.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Description</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Courses, cinéma..."
        style={styles.input}
      />

      <Text style={styles.label}>Catégorie</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Ex: Courses, Transport..."
        style={styles.input}
      />

      <Text style={styles.label}>Montant</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <TouchableOpacity style={styles.buttonRemove} onPress={handleRemove}>
        <Text style={styles.buttonText}>Supprimer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
}

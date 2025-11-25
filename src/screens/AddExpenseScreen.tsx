import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { nanoid } from 'nanoid/non-secure';
import styles from '../styles/AddExpenseScreen.styles';
import { Expense } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export default function AddExpenseScreen({ navigation, route }: Props) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    if (!description || !amount) return;

    const parsedAmount = Number(amount.replace(',', '.'));
    if (isNaN(parsedAmount)) return;

    const newExpense: Expense = {
      id: nanoid(),
      label: description,
      category,
      amount: parsedAmount,
    };

    if (route.params?.addExpense) {
      route.params.addExpense(newExpense);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
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

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
}

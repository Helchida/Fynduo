import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Expense } from '../navigation/types';
import styles from '../styles/ExpenseItem.styles';

type Props = {
  expense: Expense;
};

export default function ExpenseItem({ expense }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>{expense.label}</Text>
        <Text style={styles.category}>{expense.category}</Text>
      </View>
      <Text style={styles.amount}>{expense.amount.toFixed(2)} €</Text>
    </View>
  );
}
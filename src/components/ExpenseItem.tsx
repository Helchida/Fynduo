import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import { Expense } from "../navigation/types";
import styles from "../styles/ExpenseItem.styles";

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onPress: (expense: Expense) => void;
}

export default function ExpenseItem({ expense, onDelete, onPress }: ExpenseItemProps) {
  
  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  }) as Animated.AnimatedInterpolation<number>;

    return (
      <Animated.View style={[styles.container, { backgroundColor: "#e11d48" }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <AntDesign name="delete" size={28} color="white" />
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === "right") onDelete(expense.id);
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(expense)}
        style={styles.container}
      >
        <View>
          <Text style={styles.label}>{expense.label}</Text>
          <Text style={styles.category}>{expense.category}</Text>
        </View>
        <Text style={styles.amount}>{expense.amount} €</Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

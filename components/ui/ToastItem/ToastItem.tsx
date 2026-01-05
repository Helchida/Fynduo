import React, { useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react-native";
import { styles } from "./ToastItem.style";
import { ToastItemProps } from "./ToastItem.type";

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} color="#10b981" />;
      case "error":
        return <AlertCircle size={20} color="#ef4444" />;
      case "warning":
        return <AlertCircle size={20} color="#f59e0b" />;
      case "info":
        return <Info size={20} color="#3b82f6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "#d1fae5";
      case "error":
        return "#fee2e2";
      case "warning":
        return "#fef3c7";
      case "info":
        return "#dbeafe";
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toastIcon}>{getIcon()}</View>
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{toast.title}</Text>
        {toast.message && (
          <Text style={styles.toastMessage}>{toast.message}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onDismiss(toast.id)}
        style={styles.toastClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={18} color="#6b7280" />
      </TouchableOpacity>
    </Animated.View>
  );
};

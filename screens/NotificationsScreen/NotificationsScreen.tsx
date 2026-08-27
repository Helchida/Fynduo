import React, { useCallback } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Bell } from "lucide-react-native";
import { useNotifications } from "hooks/useNotifications";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/types";

dayjs.locale("fr");

const NotificationsScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { notifications, refreshNotifications, markNotificationRead, markAllNotificationsRead, pushNotificationsEnabled, pushNotificationsSupported, pushNotificationsLoading, setPushNotificationsEnabled } = useNotifications();

  useFocusEffect(useCallback(() => {
    let isFocused = true;
    const refreshAndMarkAsRead = async () => {
      const loadedNotifications = await refreshNotifications();
      if (isFocused) await markAllNotificationsRead(loadedNotifications);
    };
    refreshAndMarkAsRead().catch((error) => console.warn("notifications_open_failed", error));
    return () => { isFocused = false; };
  }, [markAllNotificationsRead, refreshNotifications]));

  const openNotification = async (notification: (typeof notifications)[number]) => {
    await markNotificationRead(notification);
    const chargeId = notification.metadata?.chargeId;
    if (typeof chargeId === "string") navigation.navigate("ChargeDetail", { chargeId, description: "dépense" });
  };

  return <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, marginBottom: 8 }}>
      <Switch
        value={pushNotificationsEnabled}
        onValueChange={(enabled) => setPushNotificationsEnabled(enabled).catch((error) => Alert.alert("Notifications", error.message))}
        disabled={!pushNotificationsSupported || pushNotificationsLoading}
        trackColor={{ false: "#d1d5db", true: "#34c759" }}
        thumbColor="#ffffff"
        accessibilityLabel="Activer les notifications sur cet appareil"
      />
      <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: pushNotificationsSupported ? "#111827" : "#9ca3af" }}>Activer les notifications sur cet appareil</Text>
    </View>
    {notifications.length === 0 ? <Text style={{ textAlign: "center", marginTop: 30, color: "#6b7280" }}>Aucune notification.</Text> : notifications.map((notification) =>
      <TouchableOpacity key={notification.id} onPress={() => openNotification(notification)} style={{ padding: 16, borderRadius: 12, backgroundColor: notification.readAt ? "#fff" : "#eaf4fb", borderWidth: 1, borderColor: notification.readAt ? "#e5e7eb" : "#9acbe8", gap: 5 }}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}><Bell size={18} color="#2980b9" /><Text style={{ fontWeight: notification.readAt ? "600" : "800", flex: 1 }}>{notification.title}</Text></View>
        <Text>{notification.message}</Text>
        <Text style={{ color: "#6b7280", fontSize: 12 }}>{dayjs(notification.createdAt).format("D MMMM YYYY à HH:mm")}</Text>
      </TouchableOpacity>,
    )}
  </ScrollView>;
};

export default NotificationsScreen;


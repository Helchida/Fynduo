import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Bell, CheckCheck } from "lucide-react-native";
import { useNotifications } from "hooks/useNotifications";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/types";

dayjs.locale("fr");

const NotificationsScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead, enablePushNotifications } = useNotifications();
  const openNotification = async (notification: (typeof notifications)[number]) => {
    await markNotificationRead(notification);
    const chargeId = notification.metadata?.chargeId;
    if (typeof chargeId === "string") navigation.navigate("ChargeDetail", { chargeId, description: "dépense" });
  };

  return <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>{unreadNotificationCount} non lue{unreadNotificationCount > 1 ? "s" : ""}</Text>
      <TouchableOpacity onPress={() => markAllNotificationsRead().catch(() => Alert.alert("Erreur", "Impossible de marquer les notifications comme lues."))} disabled={!unreadNotificationCount} style={{ padding: 8 }}>
        <CheckCheck size={21} color="#2980b9" />
      </TouchableOpacity>
    </View>
    <TouchableOpacity onPress={() => enablePushNotifications().catch((error) => Alert.alert("Notifications", error.message))} style={{ padding: 14, borderRadius: 10, backgroundColor: "#eaf4fb", marginBottom: 8 }}>
      <Text style={{ color: "#1d5f87", fontWeight: "700" }}>Activer les notifications push sur cet appareil</Text>
    </TouchableOpacity>
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


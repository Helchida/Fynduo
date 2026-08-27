import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { auth } from "services/firebase/config";
import { supabase } from "services/supabase/config";
import { INotification } from "@/types";
import { requestWebPushSubscription, subscriptionFingerprint, updateAppBadge } from "services/notifications/webPush";
import { useAuth } from "hooks/useAuth";

type NotificationsContextValue = {
  notifications: INotification[];
  unreadNotificationCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (notification: INotification) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  enablePushNotifications: () => Promise<void>;
};

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const callNotifications = async (body: Record<string, unknown>) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Utilisateur non authentifié");
  const { data, error } = await supabase.functions.invoke("notifications", {
    body, headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data;
};

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const unreadNotificationCount = notifications.filter((notification) => !notification.readAt).length;

  const refreshNotifications = useCallback(async () => {
    if (!auth.currentUser) return;
    const data = await callNotifications({ action: "list" });
    setNotifications((data.notifications ?? []).map((item: any) => ({
      id: item.id, type: item.type, title: item.title, message: item.message,
      metadata: item.metadata ?? {}, createdAt: item.created_at, readAt: item.read_at,
    })));
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    refreshNotifications().catch((error) => console.warn("notifications_refresh_failed", error));
    // Firebase authentication cannot be applied to Supabase Realtime RLS.
    // Small polling keeps the inbox live without exposing notifications publicly.
    const interval = setInterval(() => refreshNotifications().catch(() => undefined), 30_000);
    return () => clearInterval(interval);
  }, [refreshNotifications, user?.id]);

  useEffect(() => { updateAppBadge(unreadNotificationCount).catch(() => undefined); }, [unreadNotificationCount]);

  const markNotificationRead = useCallback(async (notification: INotification) => {
    if (notification.readAt) return;
    await callNotifications({ action: "mark_read", notificationId: notification.id });
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await callNotifications({ action: "mark_all_read" });
    setNotifications((current) => current.map((item) => item.readAt ? item : { ...item, readAt: new Date().toISOString() }));
  }, []);

  const enablePushNotifications = useCallback(async () => {
    if (Platform.OS !== "web") throw new Error("Les notifications web sont disponibles dans la PWA installée.");
    const vapidKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) throw new Error("La clé publique VAPID n'est pas configurée.");
    const subscription = await requestWebPushSubscription(vapidKey);
    await callNotifications({ action: "subscribe", subscription: subscription.toJSON(), fingerprint: subscriptionFingerprint(subscription.endpoint), platform: "web" });
  }, []);

  const value = useMemo(() => ({ notifications, unreadNotificationCount, refreshNotifications, markNotificationRead, markAllNotificationsRead, enablePushNotifications }), [notifications, unreadNotificationCount, refreshNotifications, markNotificationRead, markAllNotificationsRead, enablePushNotifications]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};


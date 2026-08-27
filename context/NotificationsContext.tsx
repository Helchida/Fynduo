import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { auth } from "services/firebase/config";
import { supabase } from "services/supabase/config";
import { INotification } from "@/types";
import { getCurrentWebPushSubscription, isWebPushSupported, requestWebPushSubscription, subscriptionFingerprint, updateAppBadge } from "services/notifications/webPush";
import { useAuth } from "hooks/useAuth";

type NotificationsContextValue = {
  notifications: INotification[];
  unreadNotificationCount: number;
  refreshNotifications: () => Promise<INotification[]>;
  markNotificationRead: (notification: INotification) => Promise<void>;
  markAllNotificationsRead: (sourceNotifications?: INotification[]) => Promise<void>;
  pushNotificationsEnabled: boolean;
  pushNotificationsSupported: boolean;
  pushNotificationsLoading: boolean;
  setPushNotificationsEnabled: (enabled: boolean) => Promise<void>;
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
  const [pushNotificationsEnabled, setPushNotificationsEnabledState] = useState(false);
  const [pushNotificationsSupported, setPushNotificationsSupported] = useState(false);
  const [pushNotificationsLoading, setPushNotificationsLoading] = useState(false);
  const unreadNotificationCount = notifications.filter((notification) => !notification.readAt).length;

  const refreshNotifications = useCallback(async () => {
    if (!auth.currentUser) return [];
    const data = await callNotifications({ action: "list" });
    const nextNotifications = (data.notifications ?? []).map((item: any) => ({
      id: item.id, type: item.type, title: item.title, message: item.message,
      metadata: item.metadata ?? {}, createdAt: item.created_at, readAt: item.read_at,
    }));
    setNotifications(nextNotifications);
    return nextNotifications;
  }, []);

  const refreshPushNotificationsState = useCallback(async () => {
    const supported = isWebPushSupported();
    setPushNotificationsSupported(supported);
    if (!supported || !auth.currentUser) {
      setPushNotificationsEnabledState(false);
      return;
    }

    const subscription = await getCurrentWebPushSubscription();
    if (!subscription) {
      setPushNotificationsEnabledState(false);
      return;
    }

    const data = await callNotifications({ action: "subscription_status", fingerprint: subscriptionFingerprint(subscription.endpoint) });
    setPushNotificationsEnabledState(Boolean(data.active));
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setPushNotificationsEnabledState(false);
      return;
    }
    refreshNotifications().catch((error) => console.warn("notifications_refresh_failed", error));
    // Firebase authentication cannot be applied to Supabase Realtime RLS.
    // Small polling keeps the inbox live without exposing notifications publicly.
    const interval = setInterval(() => refreshNotifications().catch(() => undefined), 30_000);
    return () => clearInterval(interval);
  }, [refreshNotifications, user?.id]);

  useEffect(() => {
    refreshPushNotificationsState().catch((error) => {
      console.warn("push_notifications_state_failed", error);
      setPushNotificationsEnabledState(false);
    });
  }, [refreshPushNotificationsState, user?.id]);

  useEffect(() => { updateAppBadge(unreadNotificationCount).catch(() => undefined); }, [unreadNotificationCount]);

  const markNotificationRead = useCallback(async (notification: INotification) => {
    if (notification.readAt) return;
    await callNotifications({ action: "mark_read", notificationId: notification.id });
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
  }, []);

  const markAllNotificationsRead = useCallback(async (sourceNotifications = notifications) => {
    if (!sourceNotifications.some((notification) => !notification.readAt)) return;
    await callNotifications({ action: "mark_all_read" });
    setNotifications((current) => current.map((item) => item.readAt ? item : { ...item, readAt: new Date().toISOString() }));
  }, [notifications]);

  const setPushNotificationsEnabled = useCallback(async (enabled: boolean) => {
    if (pushNotificationsLoading) return;
    setPushNotificationsLoading(true);
    try {
      if (!enabled) {
        const subscription = await getCurrentWebPushSubscription();
        if (!subscription) {
          setPushNotificationsEnabledState(false);
          return;
        }

        await callNotifications({ action: "unsubscribe", fingerprint: subscriptionFingerprint(subscription.endpoint) });
        const unsubscribed = await subscription.unsubscribe();
        if (!unsubscribed) throw new Error("Impossible de désactiver les notifications sur cet appareil.");
        setPushNotificationsEnabledState(false);
        return;
      }

    if (Platform.OS !== "web") throw new Error("Les notifications web sont disponibles dans la PWA installée.");
    const vapidKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) throw new Error("La clé publique VAPID n'est pas configurée.");
    const subscription = await requestWebPushSubscription(vapidKey);
    await callNotifications({ action: "subscribe", subscription: subscription.toJSON(), fingerprint: subscriptionFingerprint(subscription.endpoint), platform: "web" });
      setPushNotificationsEnabledState(true);
    } catch (error) {
      await refreshPushNotificationsState().catch(() => setPushNotificationsEnabledState(false));
      throw error;
    } finally {
      setPushNotificationsLoading(false);
    }
  }, [pushNotificationsLoading, refreshPushNotificationsState]);

  const value = useMemo(() => ({ notifications, unreadNotificationCount, refreshNotifications, markNotificationRead, markAllNotificationsRead, pushNotificationsEnabled, pushNotificationsSupported, pushNotificationsLoading, setPushNotificationsEnabled }), [notifications, unreadNotificationCount, refreshNotifications, markNotificationRead, markAllNotificationsRead, pushNotificationsEnabled, pushNotificationsSupported, pushNotificationsLoading, setPushNotificationsEnabled]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};


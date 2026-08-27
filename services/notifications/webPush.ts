import { Platform } from "react-native";

const urlBase64ToUint8Array = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

export const isWebPushSupported = () =>
  Platform.OS === "web" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export async function requestWebPushSubscription(vapidPublicKey: string) {
  if (!isWebPushSupported()) throw new Error("Notifications push non prises en charge par cet appareil.");
  if (Notification.permission === "denied") throw new Error("Les notifications ont été refusées dans les réglages du navigateur.");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission de notifications non accordée.");
  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  return existingSubscription ?? registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) });
}

export async function getCurrentWebPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported() || Notification.permission !== "granted") return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function updateAppBadge(count: number) {
  if (Platform.OS !== "web") return;
  const navigatorWithBadge = navigator as Navigator & { setAppBadge?: (value?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (count > 0) await navigatorWithBadge.setAppBadge?.(count);
  else await navigatorWithBadge.clearAppBadge?.();
}

export const subscriptionFingerprint = (endpoint: string) => endpoint;


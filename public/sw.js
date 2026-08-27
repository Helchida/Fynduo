self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(Promise.all([
    payload.badgeCount > 0 && self.navigator.setAppBadge ? self.navigator.setAppBadge(payload.badgeCount) : self.navigator.clearAppBadge?.(),
    self.registration.showNotification(payload.title || "Fynduo", {
    body: payload.body || "Vous avez une nouvelle notification.",
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
    data: payload.data || {},
    }),
  ]));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const chargeId = event.notification.data?.chargeId;
  event.waitUntil(clients.openWindow(chargeId ? `/?chargeId=${encodeURIComponent(chargeId)}` : "/"));
});


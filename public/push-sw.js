self.addEventListener("push", (event) => {
  let message = {};
  try { message = event.data?.json() || {}; } catch { /* Ignore malformed payloads. */ }
  event.waitUntil(self.registration.showNotification(message.title || "Marobel", {
    body: message.body || "Tienes un aviso nuevo.",
    icon: new URL("favicon.svg", self.registration.scope).href,
    badge: new URL("favicon.svg", self.registration.scope).href,
    tag: message.tag || "marobel-notification",
    data: { path: message.path || "/" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = String(event.notification.data?.path || "/").replace(/^\/+/, "");
  const destination = new URL(path, self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) {
      await existing.navigate(destination);
      return existing.focus();
    }
    return self.clients.openWindow(destination);
  })());
});

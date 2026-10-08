self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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
    try {
      if (await self.clients.openWindow(destination)) return;
    } catch (error) {
      console.error("No se pudo abrir Marobel desde el aviso:", error);
    }
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => client.url.startsWith(self.registration.scope));
    if (existing) await existing.focus();
  })());
});

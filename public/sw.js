const CACHE_NAME = "haklarim-v3";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/offline",
  "/manifest.json",
  "/pricing",
  "/tools/glossary",
  "/tools/mediation",
  "/tools/statute-of-limitations",
  "/tools/court-fees",
];

// Install - precache critical resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls and external requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // Navigation requests → offline page
        if (event.request.mode === "navigate") {
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
        }

        return new Response("Offline", { status: 503 });
      })
  );
});

// Push notification
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Haklarım";
  const options = {
    body: data.body || "Yeni bir bildiriminiz var",
    icon: "/icons/icon-192x192.svg",
    badge: "/icons/icon-192x192.svg",
    tag: data.tag || "default",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

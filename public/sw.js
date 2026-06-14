// Service Worker para la PWA Paradón - Buses de Costa Rica
const CACHE_NAME = "paradon-cache-v2";

// Recursos principales a cachear durante la instalación
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/main.js",
  "/src/style.css",
  "/src/database.js",
  "/src/utils.js",
  "/src/components/bottom-nav.js",
  "/src/components/view-home.js",
  "/src/components/view-search.js",
  "/src/components/view-favorites.js",
  "/src/components/view-map.js",
  "/src/components/view-profile.js",
  "/src/components/view-detail.js",
  "/logo.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
  // Caching CDN libraries for complete offline mapping capability
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

// Instalar el Service Worker y cachear recursos estáticos
self.addEventListener("install", (e) => {
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    self.skipWaiting();
    return;
  }
  console.log("[Service Worker] Instalando...");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Cacheando archivos base...");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar el SW y limpiar versiones antiguas de caché
self.addEventListener("activate", (e) => {
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    e.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      }).then(() => {
        return self.registration.unregister();
      }).then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => {
          if (client.url && client.navigate) {
            client.navigate(client.url);
          }
        });
      })
    );
    return;
  }
  console.log("[Service Worker] Activando...");
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Borrando caché vieja:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones y responder usando Stale-While-Revalidate
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Evitar interferencia del Service Worker en desarrollo (localhost) para no romper HMR de Vite
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return;
  }

  // No interceptar peticiones de extensiones de navegador (chrome-extension://) o esquemas que no sean HTTP/S
  if (!e.request.url.startsWith("http")) {
    return;
  }

  // Estrategia especial para Teselas de Mapa (Evitar llenar el caché indefinidamente con miles de imágenes png)
  if (url.hostname.includes("basemaps.cartocdn.com") || url.hostname.includes("tile.openstreetmap.org")) {
    e.respondWith(
      caches.open("paradon-map-tiles").then((cache) => {
        return cache.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Devolver del caché e ir a buscar de todos modos para actualizar en segundo plano
            fetch(e.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(e.request, networkResponse);
              }
            }).catch(() => {/* Silenciar errores de red offline */});
            return cachedResponse;
          }

          // Si no está en caché, traer de red y cachear
          return fetch(e.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Si falla la red y no está en caché, simplemente falla de forma natural
            return new Response("", { status: 404, statusText: "Offline Map Tile" });
          });
        });
      })
    );
    return;
  }

  // Estrategia Stale-While-Revalidate estándar para recursos del sitio
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          // Si la respuesta es válida, actualizar el caché
          if (networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.log("[Service Worker] Fallo de red (offline), sirviendo del caché local:", e.request.url);
          // Si falla la red y no hay caché, retornar error controlado
          if (!cachedResponse) {
            throw err;
          }
        });

        // Devolver respuesta cacheada si existe de inmediato, de lo contrario esperar por red
        return cachedResponse || fetchPromise;
      });
    })
  );
});

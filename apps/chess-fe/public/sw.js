// Minimal offline-first service worker (no build step). Runtime caching only, so it
// works regardless of hashed asset names. Cross-origin requests (the Lichess tablebase
// API) are never intercepted — they always go to the network.

const CACHE = "efc-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (tablebase) pass through

  // Navigations: network-first, falling back to the cached app shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match("/")) ?? Response.error()),
    );
    return;
  }

  // Same-origin assets (JS, CSS, engine, icons): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);

      const revalidate = (async () => {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      })();

      if (cached) {
        event.waitUntil(revalidate.catch(() => undefined)); // refresh in the background
        return cached;
      }
      return revalidate;
    })(),
  );
});

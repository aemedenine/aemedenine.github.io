const CACHE_NAME = "atelier-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/js/script.js",
  "/boutique.html",
  "/calcul-condensateur.html",
  "/calcul-puissance.html",
  "/calcul-resistance.html",
  "/contact.html",
  "/faq.html",
  "/radio-check.html",
  "/radio-codes.html",
  "/services.html",
  "/services-atelier.html",
  "/forum/index.html",
  "/forum/atelier.html",
  "/forum/pannes.html",
  "/forum/projets.html"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match("/offline.html"))
  );
});

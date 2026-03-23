const CACHE_NAME = "atelier-v4";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/script.js",
  "/offline.html",
  // صفحاتك
  "/boutique.html","/calcul-condensateur.html","/calcul-puissance.html",
  "/calcul-resistance.html","/contact.html","/faq.html","/radio-check.html",
  "/radio-codes.html","/services.html","/services-atelier.html",
  "/forum/index.html","/forum/atelier.html","/forum/pannes.html","/forum/projets.html",
  // صور وأيقونات ضرورية
  "/images/logo.png","/images/favicon.png","/images/sof.jpg",
  "/images/hero-left-1.png","/images/hero-right-1.png","/images/hero-left-11.jpg",
  "/images/before1.jpeg","/images/after1.jpeg","/images/before2.jpg","/images/after2.jpg",
  // الفيديوهات (باش تشغل offline)
  "/videos/video1.mp4","/videos/video2.mp4","/videos/video3.mp4",
  "/videos/video4.mp4","/videos/video5.mp4","/videos/video6.mp4"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => name !== CACHE_NAME ? caches.delete(name) : null)
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  // Firebase ديناميكي → network first
  if (event.request.url.includes("firebase")) {
    return event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match("/offline.html"))
  );
});

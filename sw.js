// ── Service Worker — Muscu RPG ─────────────────────────────────────────────
const CACHE_NAME = 'muscu-rpg-v14';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/components.css',
  '/css/badges.css',
  '/css/charts.css',
  '/css/badges-premium.css',
  '/js/data.js',
  '/js/timer.js',
  '/js/exercises.js',
  '/js/tiers.js',
  '/js/utils.js',
  '/js/render/journal.js',
  '/js/render/pr.js',
  '/js/render/rpg.js',
  '/js/render/simulation.js',
  '/js/render/stats.js',
  '/js/render/badges.js',
  '/js/body/body3d.js',
  '/js/body/front.js',
  '/js/body/back.js',
  '/js/app.js',
];

// ── Install : cache all assets ─────────────────────────────────────────────
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── Activate : clean old caches ────────────────────────────────────────────
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch : network-first, cache en fallback offline ──────────────────────
self.addEventListener('fetch', function(e) {
  // Ne pas intercepter les requêtes non-GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(response) {
      // Mettre en cache les réponses valides
      if (response && response.status === 200 && response.type === 'basic') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Hors-ligne : servir depuis le cache
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('/index.html');
      });
    })
  );
});

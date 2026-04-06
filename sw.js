// ── Service Worker — Muscu RPG ─────────────────────────────────────────────
const CACHE_NAME = 'muscu-rpg-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/components.css',
  '/css/badges.css',
  '/css/charts.css',
  '/js/data.js',
  '/js/exercises.js',
  '/js/tiers.js',
  '/js/utils.js',
  '/js/render/journal.js',
  '/js/render/pr.js',
  '/js/render/rpg.js',
  '/js/render/stats.js',
  '/js/render/badges.js',
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

// ── Fetch : cache-first strategy ───────────────────────────────────────────
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        // Offline fallback
        return caches.match('/index.html');
      });
    })
  );
});

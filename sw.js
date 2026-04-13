// ── Service Worker — Muscu RPG ─────────────────────────────────────────────
var CACHE_NAME = 'muscu-rpg-v72';
var ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/components.css',
  '/css/badges.css',
  '/css/charts.css',
  '/css/badges-premium.css',
  '/js/lang.js',
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
  '/js/body/body3d_v62.js',
  '/js/body/front.js',
  '/js/body/back.js',
  '/js/app.js',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      var promises = [];
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] !== CACHE_NAME) {
          promises.push(caches.delete(keys[i]));
        }
      }
      return Promise.all(promises);
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(response) {
      if (response && response.status === 200 && response.type === 'basic') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('/index.html');
      });
    })
  );
});

const CACHE_NAME = 'password-transformer-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        
        // Fetch from network and dynamically cache new resources (like specific font files requested by Google Fonts CSS)
        return fetch(event.request).then(fetchRes => {
          if(!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic' && fetchRes.type !== 'cors') {
            return fetchRes;
          }

          if (event.request.method === 'GET') {
            const responseToCache = fetchRes.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return fetchRes;
        }).catch(() => {
          return new Response('App is offline and resource not found in cache.');
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// public/service-worker.js
const CACHE_NAME = 'listo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/generated-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // החזרה מהמטמון אם קיים
        if (response) {
          return response;
        }
        // אחרת, פניה לשרת
        return fetch(event.request)
          .then(response => {
            // ודא שיש תשובה תקינה לשמירה במטמון
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // שכפול התשובה לשמירה במטמון
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});
const CACHE_NAME = 'grow-taller-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  // You would add other static assets here like CSS, JS bundles, and images
  // For this project structure, caching the main files is enough for a basic offline experience.
];

self.addEventListener('install', (event: any) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

const CACHE_NAME = 'calc-v6'; // Bumped to v6
const ASSETS = [
    './',
    './index.html',
    './style.css?v=1.2',
    './script.js?v=1.2',
    './manifest.json',
    '../icon-192.png',
    '../icon-512.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force update
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Claim clients immediately
            self.clients.claim(),
            // Delete old caches
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

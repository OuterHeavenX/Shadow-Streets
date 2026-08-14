const CACHE_NAME = 'shadow-streets-v8';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './css/juice.css',
    './css/livingBlocks.css',
    './js/main.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
        .then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
        .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
        .then(response => {
            if (response && response.ok && event.request.url.startsWith(self.location.origin)) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            }
            return response;
        })
        .catch(() => caches.match(event.request))
    );
});

const CACHE_NAME = "utpras-app-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames =>
                Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (
        request.method !== "GET" ||
        new URL(request.url).origin !== self.location.origin
    ) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then(response => {
                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, copy));

                return response;
            })
            .catch(() =>
                caches.match(request)
                    .then(cachedResponse =>
                        cachedResponse || caches.match("./index.html")
                    )
            )
    );
});

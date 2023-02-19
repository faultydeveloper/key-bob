declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `v${APP_VERSION}.${BUILD_NUMBER}`;
const URLS = [
    `${PUBLIC_PATH}/`,
    `${PUBLIC_PATH}/index.html`,
    `${PUBLIC_PATH}/index.js`,
    `${PUBLIC_PATH}/favicon.png`,
    `${PUBLIC_PATH}/manifest.webmanifest`
];

self.addEventListener('install', e => {
    e.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(URLS);
    })());
});

self.addEventListener('activate', e => {
    e.waitUntil((async () => {
        console.log('Activated');
        const keys = await caches.keys();
        for (const key of keys) {
            if (key != CACHE_NAME) {
                console.log(`Deleting ${key}...`);
                await caches.delete(key);
            }
        }
    })());
});

self.addEventListener('fetch', e => {
    e.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(e.request) || await fetch(e.request);
    })());
});

export default null;
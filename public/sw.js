//SERVICE WORKER

if (navigator.serviceWorker.controller) {
    console.log('[PWA Info] active service worker found, no need to register')
} else {
    //Register the ServiceWorker
    navigator.serviceWorker.register('service-worker.js', {
        scope: '/'
    }).then(function (reg) {
        console.log('Service worker has been registered for scope:' + reg.scope);
    });
}
//_________________________________________________________________________________-

self.addEventListener('install', function(event) {
    var offlineSite = new Request('rules.html');
    event.waitUntil(
        fetch(offlineSite).then(function(response) {
            return caches.open('mypwa-offline').then(function(cache) {
                console.log('[PWA Info] Cached offline page');
                return cache.put(offlineSite, response);
            });
        }));
});

// Serve offline page if the fetch fails
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).catch(function(error) {
                console.error( '[PWA Info] App offline. Serving stored offline page: ' + error );
                return caches.open('mypwa-offline').then(function(cache) {
                    return cache.match('my-offline-page.html');
                });
            }
        ));
});

// Event to update the offline page
self.addEventListener('refreshOffline', function(response) {
    return caches.open('mypwa-offline').then(function(cache) {
        console.log('[PWA Info] Offline page updated');
        return cache.put(offlineSite, response);
    });
});
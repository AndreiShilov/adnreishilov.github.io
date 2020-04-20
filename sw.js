var version = 'v5::';

var requests = [
    '/highlight/styles/darcula.css',
    '/bootstrap/css/bs3.3.7.min.css',
    '/css/main.min.css',
    '/js/main.min.js',
    '/js/jq.min.js',
    '/highlight/highlight.pack.js',
    '/js/ie10-viewport-bug-workaround.min.js'

];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches
            .open(version + 'fundamentals')
            .then(function(cache) {

                return cache.addAll(requests);
            })
            .then(function() {
            })
    );
});
self.addEventListener("fetch", function(event) {

    var wrongPath = true;

    requests.forEach(function(request){
       if(event.request.url.endsWith(request)){
           wrongPath = false;
       }
    });

    if (event.request.method !== 'GET' || wrongPath) {
        return;
    }
    event.respondWith(
        caches
            .match(event.request)
            .then(function(cached) {
                var networked = fetch(event.request)
                    .then(fetchedFromNetwork, unableToResolve)
                    .catch(unableToResolve);
                return cached || networked;

                function fetchedFromNetwork(response) {
                    var cacheCopy = response.clone();
                    caches
                        .open(version + 'pages')
                        .then(function add(cache) {
                            cache.put(event.request, cacheCopy);
                        })
                        .then(function() {
                        });

                    return response;
                }

                function unableToResolve () {
                    return new Response('<h1>Service Unavailable</h1>', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                                                 'Content-Type': 'text/html'
                                             })
                    });
                }
            })
    );
});
self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches
            .keys()
            .then(function (keys) {
                return Promise.all(
                    keys
                        .filter(function (key) {
                            return !key.startsWith(version);
                        })
                        .map(function (key) {
                            return caches.delete(key);
                        })
                );
            })
            .then(function() {
            })
    );
});
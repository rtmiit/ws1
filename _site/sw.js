const version = '20220204134121';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/ws1/general/2016/08/29/example-post-three/","/ws1/history/external%20sources/2016/08/28/example-post-two/","/ws1/general/external%20sources/2016/08/27/example-post-one/","/ws1/categories/","/ws1/components/","/ws1/elements/","/ws1/blog/","/ws1/","/ws1/manifest.json","/ws1/offline/","/ws1/overview/","/ws1/ppb/","/ws1/assets/search.json","/ws1/search/","/ws1/assets/styles.css","/ws1/thanks/","/ws1/redirects.json","/ws1/blog/page2/","/ws1/feed.xml","/ws1/sitemap.xml","/ws1/robots.txt","/ws1/assets/styles.css.map","/ws1/assets/logos/iith3.png", "/ws1/assets/default-offline-image.png", "/ws1/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/ws1/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});

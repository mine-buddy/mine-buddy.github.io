'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "c89a57d2d745a34adfac754c6524b08f",
"version.json": "0280cd63e9f242515d46085b7822e700",
"icons/Icon-512.png": "28c8d2c42173cb1dc590d93a2daebbe0",
"icons/Icon-192.png": "8b0137acb218a04898ec5bde1e3fc260",
"icons/Icon-maskable-512.png": "28c8d2c42173cb1dc590d93a2daebbe0",
"icons/Icon-maskable-192.png": "8b0137acb218a04898ec5bde1e3fc260",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62",
"favicon.png": "ed84e13599e5c31249e7e76b9a68774b",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"index.html": "d66a6b695d9ec35bf0157ec84bf344c4",
"/": "d66a6b695d9ec35bf0157ec84bf344c4",
"main.dart.js": "c72a80935193269b2637cdf67a6aabb8",
"splash/img/dark-4x.png": "6235f9cffa0eb44fff57adccf2c4131f",
"splash/img/branding-4x.png": "a42ae12b25a85190f3f2fd1a260db561",
"splash/img/branding-dark-3x.png": "a1f267a882cbc81453c0c46374d9fc44",
"splash/img/dark-1x.png": "dfbe204d2da23277baf7d734efb00c0a",
"splash/img/branding-2x.png": "18d35cad16ff890e30c3de8e632e54bf",
"splash/img/dark-2x.png": "ec7d8f0ccbd7256b3a8c0f0cf9c2397d",
"splash/img/light-1x.png": "dfbe204d2da23277baf7d734efb00c0a",
"splash/img/light-3x.png": "4c3172b4ad4a29d6a39d6fb2f3d544d8",
"splash/img/dark-3x.png": "4c3172b4ad4a29d6a39d6fb2f3d544d8",
"splash/img/light-2x.png": "ec7d8f0ccbd7256b3a8c0f0cf9c2397d",
"splash/img/branding-dark-1x.png": "3fa8ef76991dfba59a27be6eaea3d38c",
"splash/img/branding-dark-4x.png": "a42ae12b25a85190f3f2fd1a260db561",
"splash/img/branding-3x.png": "a1f267a882cbc81453c0c46374d9fc44",
"splash/img/branding-1x.png": "3fa8ef76991dfba59a27be6eaea3d38c",
"splash/img/light-4x.png": "6235f9cffa0eb44fff57adccf2c4131f",
"splash/img/branding-dark-2x.png": "18d35cad16ff890e30c3de8e632e54bf",
"splash/style.css": "97db6f9b0c5167bd230c6012c90e93d2",
"splash/splash.js": "123c400b58bea74c1305ca3ac966748d",
"assets/NOTICES": "56ff6bc82f974cb93894faf03797451c",
"assets/shaders/ink_sparkle.frag": "83c076d55fdbf5e6f73f29c79926992c",
"assets/FontManifest.json": "838bc839e5b274574777cddeebb6cecc",
"assets/AssetManifest.json": "a5767b9f501e1e493ebf8f5c5ce7ca2b",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/branding.png": "e4d8ac25371d3b5496d4dac0e5fbd2fa",
"assets/assets/icon.png": "cfbcde115e7000c2eb9e034b387b296b",
"assets/assets/Monocraft.otf": "c6391aa65c1d0078d1f6417ee84bf469"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

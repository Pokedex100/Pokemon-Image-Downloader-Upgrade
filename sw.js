const CACHE_NAME = "pokedex-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/pokedexdata.json",
  "/Images/normal.json",
  "/Images/shiny.json",
  "/assets/logo.png",
  "/assets/github.svg",
  "/assets/pokedex.png",
];

// Install event - cache initial resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();

        // Cache Pokemon images dynamically
        if (
          event.request.url.includes("[HOME] Pokémon Renders/Normal/") ||
          event.request.url.includes("[HOME] Pokémon Renders/Shiny/")
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for caching Pokemon images
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_POKEMON_IMAGES") {
    const { normalImages, shinyImages } = event.data;

    caches.open(CACHE_NAME).then((cache) => {
      // Cache normal Pokemon images
      normalImages.forEach((imageUrl) => {
        fetch(imageUrl)
          .then((response) => {
            if (response.ok) {
              cache.put(imageUrl, response.clone());
            }
          })
          .catch(() => {
            // Silently ignore cache failures
          });
      });

      // Cache shiny Pokemon images
      shinyImages.forEach((imageUrl) => {
        fetch(imageUrl)
          .then((response) => {
            if (response.ok) {
              cache.put(imageUrl, response.clone());
            }
          })
          .catch(() => {
            // Silently ignore cache failures
          });
      });
    });
  }
});

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Smartphone, RefreshCw } from "lucide-react";

/**
 * PWA Provider - Handles:
 * 1. PWA meta tags injection (theme-color, viewport, apple-mobile-web-app)
 * 2. Service worker registration for offline caching
 * 3. Install prompt (A2HS - Add to Home Screen)
 * 4. Update notification when new SW version is available
 */

// Inline service worker code as a blob (since we can't create files outside /src)
const SW_CODE = `
const CACHE_NAME = 'ielts-pro-v2';
const STATIC_CACHE = 'ielts-pro-static-v2';
const IMAGE_CACHE = 'ielts-pro-images-v1';
const OFFLINE_URL = '/';

// Max items per cache to prevent unbounded growth
const IMAGE_CACHE_LIMIT = 60;
const STATIC_CACHE_LIMIT = 100;

const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Helper: trim cache to max size (LRU-style  oldest first)
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    for (let i = 0; i < keys.length - maxItems; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Navigation requests: Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 2. Image requests: Cache-first with background revalidation
  if (request.destination === 'image' || url.hostname === 'images.unsplash.com') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Background revalidate (stale-while-revalidate)
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
              trimCache(IMAGE_CACHE, IMAGE_CACHE_LIMIT);
            }
          }).catch(() => {});
          return cachedResponse;
        }
        // Not in cache  fetch, cache, return
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            trimCache(IMAGE_CACHE, IMAGE_CACHE_LIMIT);
          }
          return networkResponse;
        } catch {
          return new Response('', { status: 408, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // 3. Static assets (JS, CSS, fonts): Stale-while-revalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            trimCache(STATIC_CACHE, STATIC_CACHE_LIMIT);
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. API calls and other requests: Network-first, cache as fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Inject PWA meta tags
  useEffect(() => {
    const metaTags = [
      { name: "theme-color", content: "#dc2f3c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "GDNN-GDTX" },
      { name: "application-name", content: "GDNN-GDTX" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "msapplication-TileColor", content: "#dc2f3c" },
    ];

    const createdTags: HTMLMetaElement[] = [];

    metaTags.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
        createdTags.push(meta);
      }
    });

    // Inject manifest link
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestData = {
        name: "GDNN-GDTX - Chinh phuc IELTS",
        short_name: "GDNN-GDTX",
        description: "Nen tang hoc IELTS hang dau Viet Nam",
        start_url: "/",
        display: "standalone",
        background_color: "#fafbfc",
        theme_color: "#dc2f3c",
        orientation: "portrait-primary",
        categories: ["education", "productivity"],
        lang: "vi",
        icons: [
          {
            src: "data:image/svg+xml," + encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="32" fill="#dc2f3c"/><text x="96" y="120" text-anchor="middle" fill="white" font-size="80" font-weight="800" font-family="sans-serif">IP</text></svg>`
            ),
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "data:image/svg+xml," + encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#dc2f3c"/><text x="256" y="320" text-anchor="middle" fill="white" font-size="220" font-weight="800" font-family="sans-serif">IP</text></svg>`
            ),
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      };
      const blob = new Blob([JSON.stringify(manifestData)], { type: "application/json" });
      const manifestUrl = URL.createObjectURL(blob);
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = manifestUrl;
      document.head.appendChild(link);
    }

    // Inject preconnect hints for external resources
    const preconnectUrls = [
      "https://images.unsplash.com",
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];
    const createdLinks: HTMLLinkElement[] = [];
    preconnectUrls.forEach((url) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = url;
        if (url.includes("gstatic")) link.crossOrigin = "anonymous";
        document.head.appendChild(link);
        createdLinks.push(link);

        // Also add dns-prefetch as fallback
        const dnsPrefetch = document.createElement("link");
        dnsPrefetch.rel = "dns-prefetch";
        dnsPrefetch.href = url;
        document.head.appendChild(dnsPrefetch);
        createdLinks.push(dnsPrefetch);
      }
    });

    return () => {
      createdTags.forEach((tag) => tag.remove());
      createdLinks.forEach((link) => link.remove());
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const swBlob = new Blob([SW_CODE], { type: "application/javascript" });
        const swUrl = URL.createObjectURL(swBlob);
        const registration = await navigator.serviceWorker.register(swUrl, {
          scope: "/",
        });

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New update available
              setWaitingWorker(newWorker);
              setShowUpdateBanner(true);
            }
          });
        });

        // Check periodically for updates (every 60 min)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      } catch {
        // SW registration failed - not critical, app works without it
        console.info("Service worker registration skipped");
      }
    };

    registerSW();
  }, []);

  // Listen for A2HS (Add to Home Screen) prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show install banner after 30s delay (not intrusive)
      const dismissed = localStorage.getItem("ielts-pro-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  const dismissInstall = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem("ielts-pro-install-dismissed", "1");
  }, []);

  const handleUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdateBanner(false);
      window.location.reload();
    }
  }, [waitingWorker]);

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[380px] z-[100] bg-white dark:bg-card rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/40 border border-gray-100 dark:border-border p-5"
            role="dialog"
            aria-label="Cai dat ung dung"
          >
            <button
              onClick={dismissInstall}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground transition-colors"
              aria-label="Dong"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-primary/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>
                  Cai dat GDNN-GDTX
                </p>
                <p className="text-[16px] text-muted-foreground mt-0.5 leading-relaxed">
                  Them vao man hinh chinh de truy cap nhanh hon va hoc offline.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-2 rounded-xl text-[16px] shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                    style={{ fontWeight: 600 }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Cai dat
                  </button>
                  <button
                    onClick={dismissInstall}
                    className="text-[16px] text-muted-foreground px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    De sau
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Banner */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[201] bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4"
            role="alert"
            aria-live="polite"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-[15px]">
              <RefreshCw className="w-4 h-4" />
              <span style={{ fontWeight: 500 }}>Phien ban moi da san sang.</span>
              <button
                onClick={handleUpdate}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                style={{ fontWeight: 600 }}
              >
                Cap nhat ngay
              </button>
              <button
                onClick={() => setShowUpdateBanner(false)}
                className="p-1 rounded hover:bg-white/20 transition-colors ml-1"
                aria-label="Dong thong bao cap nhat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

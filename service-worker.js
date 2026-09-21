const CACHE_NAME = 'court-booking-v3';

// Nota: jangan masukkan './index.html' — Cloudflare Pages 308-redirect ke './',
// dan respons ter-redirect yang di-cache akan gagalkan navigasi PWA (ERR_FAILED).
const APP_SHELL = [
  './',
  './style.css',
  './app.js',
  './manifest.json',
  './app-icon.svg',
  './apple-touch-icon.png',
  './preview.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Navigasi tak boleh terima respons ter-redirect. Salin semula respons tanpa
// flag 'redirected' supaya kandungan terus disajikan pada URL asal.
function stripRedirect(response) {
  if (!response.redirected) return response;
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Cross-origin (Supabase, Google Fonts) — terus ke rangkaian, jangan cache.
  if (!sameOrigin) return;

  // Navigasi: rangkaian dulu supaya HTML sentiasa terkini, cache jadi sandaran offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('./', copy)).catch(() => {});
          }
          return stripRedirect(res);
        })
        .catch(() => caches.match('./', { ignoreSearch: true }).then(
          cached => cached || new Response(
            '<meta charset="utf-8"><p style="font:16px system-ui;padding:24px">Tiada sambungan internet.</p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        ))
    );
    return;
  }

  // Aset: sajikan cache dahulu, kemas kini di latar belakang.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok && res.type === 'basic' && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

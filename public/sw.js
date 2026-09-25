// ClubComm — service worker (Besluit 37). Maakt de app installeerbaar en laat bij geen verbinding de laatst geladen app zien.
// Altijd eerst het netwerk (zodat iedereen meteen de nieuwste versie heeft); de cache is alleen reserve. Gegevens (Supabase) worden nooit bewaard.
const CACHE = 'clubcomm-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Supabase, Brevo e.d. altijd rechtstreeks
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const kopie = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, kopie)); } return r; })
    .catch(() => caches.match(e.request).then((r) => r || caches.match('/'))));
});

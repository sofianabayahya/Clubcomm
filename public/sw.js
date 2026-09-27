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

// Pushmeldingen (Besluit 53): tonen, en bij een tik de app openen op het juiste bericht
self.addEventListener('push', (e) => {
  let p = {}; try { p = e.data ? e.data.json() : {}; } catch (x) { p = { titel: 'ClubComm', tekst: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(p.titel || 'ClubComm', { body: p.tekst || '', tag: p.tag, data: { url: p.url || '/' }, icon: '/assets/icon-192.png' }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ws) => {
    const w = ws.find((x) => new URL(x.url).origin === location.origin);
    if (w) return w.navigate(url).then((x) => (x || w).focus()).catch(() => w.focus());
    return self.clients.openWindow(url);
  }));
});

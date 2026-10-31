// Tasbeh — internetsiz ishlashi uchun
const CACHE = 'tasbeh-v3';
const FILES = ['./', './index.html', './manifest.json', './fonts/amiri.woff2', './fonts/montserrat.woff2',
  './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Keshdan beradi, orqada yangilaydi (fon rasmlari ham birinchi ochilganda saqlanadi)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // manifest va sw har doim internetdan (o'rnatish to'g'ri ishlashi uchun)
  if (/manifest\.json$|sw\.js$/.test(new URL(e.request.url).pathname)) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true })
      || (e.request.mode === 'navigate' ? await cache.match('./index.html') : null);
    const fresh = fetch(e.request).then(res => { if (res && res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => cached);
    return cached || fresh;
  }));
});

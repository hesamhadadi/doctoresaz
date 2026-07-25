// سرویس‌ورکر دکتر ساز
// نکته‌ی مهم: صفحه‌ها (HTML) هرگز از کش سرو نمی‌شوند تا بعد از هر انتشار،
// کاربر بلافاصله نسخه‌ی جدید را ببیند. فقط دارایی‌های هش‌دار کش می‌شوند.
const CACHE = 'doctoresaz-v3';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/manifest.webmanifest', '/icon.svg'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;                 // داده همیشه تازه
  if (request.mode === 'navigate') return;                       // صفحه‌ها همیشه از شبکه
  if (request.destination === 'document') return;

  // فقط دارایی‌های هش‌دار/ثابت: کش‌اول
  const cacheable = url.pathname.startsWith('/_next/static')
    || /\.(svg|png|jpg|jpeg|webp|woff2?|ico)$/.test(url.pathname);
  if (!cacheable) return;

  e.respondWith(
    caches.match(request).then((hit) =>
      hit || fetch(request).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); }
        return res;
      })
    )
  );
});

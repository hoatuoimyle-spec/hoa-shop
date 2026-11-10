// Service worker — Tạp Hóa Mỹ Lệ. Chỉ lưu tệp tĩnh; trang, giá và API luôn lấy mới từ mạng.
const CACHE = 'myle-v5';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/admin')) return;
  const isStatic = u.pathname.startsWith('/_next/static/') || u.pathname.startsWith('/images/') || /\.(png|svg|woff2?)$/.test(u.pathname);
  if (isStatic) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); } return res; })));
  } else if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(() => caches.match('/') .then((h) => h || new Response('Bạn đang ngoại tuyến. Vui lòng kết nối mạng để xem sản phẩm.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }))));
  }
});

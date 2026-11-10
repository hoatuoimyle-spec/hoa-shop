import { getSettings, hydrateProduct } from './util.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// JSON nhúng trong <script>: chặn '<' để không thoát được khỏi thẻ script
export const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const clip = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
export const baseUrl = (request, env) => (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
export const abs = (base, u) => (!u ? '' : /^https?:\/\//.test(u) ? u : base + u);

export async function shopInfo(env) {
  const s = await getSettings(env.DB);
  return { name: s.shop_name || 'Tạp Hóa Mỹ Lệ', address: s.shop_address || 'Ấp 3, xã Long Phú, TP. Cần Thơ', phone: s.shop_phone || '' };
}

export function storeLd(base, shop) {
  const o = {
    '@context': 'https://schema.org', '@type': 'Store', name: shop.name, url: base + '/', foundingDate: '1987',
    address: { '@type': 'PostalAddress', streetAddress: 'Ấp 3, xã Long Phú', addressRegion: 'TP. Cần Thơ', addressCountry: 'VN' },
  };
  if (shop.phone) o.telephone = shop.phone;
  return o;
}

// Lấy trang "vỏ" tĩnh rồi chèn tiêu đề, mô tả, JSON-LD, nội dung cho bot và dữ liệu khởi tạo.
export async function renderShell(request, env, shellPath, m) {
  const base = baseUrl(request, env);
  const shell = await env.ASSETS.fetch(new URL(shellPath, request.url));
  const head =
    `<link rel="canonical" href="${esc(m.canonical)}">` +
    `<meta property="og:type" content="${m.ogType || 'website'}"><meta property="og:locale" content="vi_VN">` +
    `<meta property="og:site_name" content="${esc(m.siteName)}"><meta property="og:title" content="${esc(m.title)}">` +
    `<meta property="og:description" content="${esc(m.description)}"><meta property="og:url" content="${esc(m.canonical)}">` +
    (m.image ? `<meta property="og:image" content="${esc(m.image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${esc(m.image)}">` : '<meta name="twitter:card" content="summary">') +
    `<meta name="twitter:title" content="${esc(m.title)}"><meta name="twitter:description" content="${esc(m.description)}">` +
    (m.ld || []).map((o) => `<script type="application/ld+json">${safeJson(o)}</script>`).join('');
  const bodyEnd = `<script>window.__SEED__=${safeJson(m.seed || {})}</script><noscript>${m.noscript || ''}</noscript>`;
  const rewritten = new HTMLRewriter()
    .on('title', { element(e) { e.setInnerContent(m.title); } })
    .on('meta[name="description"]', { element(e) { e.setAttribute('content', m.description); } })
    .on('meta[property^="og:"]', { element(e) { e.remove(); } })
    .on('meta[name^="twitter:"]', { element(e) { e.remove(); } })
    .on('meta[name="robots"]', { element(e) { e.setAttribute('content', 'index, follow'); } })
    .on('link[rel="canonical"]', { element(e) { e.remove(); } })
    .on('head', { element(e) { e.append(head, { html: true }); } })
    .on('body', { element(e) { e.append(bodyEnd, { html: true }); } })
    .transform(new Response(shell.body, { status: m.status || 200, headers: shell.headers }));
  const h = new Headers(rewritten.headers);
  h.set('content-type', 'text/html; charset=utf-8');
  h.set('cache-control', 'public, max-age=0, s-maxage=60');
  return new Response(rewritten.body, { status: m.status || 200, headers: h });
}

export async function notFound(request, env) {
  const r = await env.ASSETS.fetch(new URL('/404.html', request.url));
  return new Response(r.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export { esc, clip, hydrateProduct };

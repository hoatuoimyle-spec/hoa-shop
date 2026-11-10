import { TAXONOMY } from './_lib/taxonomy.js';
import { baseUrl } from './_lib/seo.js';

export async function onRequestGet({ request, env }) {
  const base = baseUrl(request, env);
  const day = (t) => new Date((t || Date.now() / 1000) * 1000).toISOString().slice(0, 10);
  const urls = [{ loc: '/', pr: '1.0' }, { loc: '/ve-chung-toi/', pr: '0.5' }, { loc: '/chinh-sach/', pr: '0.3' }];
  for (const t of TAXONOMY) {
    urls.push({ loc: `/danh-muc/${t.slug}/`, pr: '0.8' });
    for (const c of t.children) urls.push({ loc: `/danh-muc/${c.slug}/`, pr: '0.7' });
  }
  let products = [];
  try { products = (await env.DB.prepare('SELECT id, updated_at FROM products WHERE active = 1 ORDER BY sort ASC').all()).results; } catch { /* chưa có DB */ }
  for (const p of products) urls.push({ loc: `/san-pham/${p.id}/`, pr: '0.9', mod: day(p.updated_at) });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${base}${u.loc}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}<priority>${u.pr}</priority></url>`).join('\n') + '\n</urlset>\n';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=300' } });
}

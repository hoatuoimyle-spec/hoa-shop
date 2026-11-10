import { hydrateProduct } from '../_lib/util.js';
import { findCategory } from '../_lib/taxonomy.js';
import { renderShell, notFound, shopInfo, baseUrl, clip, esc } from '../_lib/seo.js';

export async function onRequestGet({ request, env, params }) {
  const slug = String(params.slug || '').toLowerCase();
  const found = findCategory(slug);
  if (!found) return notFound(request, env);
  const { top, sub } = found;
  const cur = sub || top;

  const base = baseUrl(request, env);
  const shop = await shopInfo(env);
  const url = `${base}/danh-muc/${cur.slug}/`;
  const { results } = sub
    ? await env.DB.prepare('SELECT * FROM products WHERE active = 1 AND category = ? AND subcategory = ? ORDER BY sort ASC LIMIT 60').bind(top.slug, sub.slug).all()
    : await env.DB.prepare('SELECT * FROM products WHERE active = 1 AND category = ? ORDER BY sort ASC LIMIT 60').bind(top.slug).all();
  const products = results.map(hydrateProduct);

  const title = `${cur.name} tại Long Phú, Cần Thơ | ${shop.name}`;
  const desc = clip(`${cur.desc || cur.name}. ${shop.name}, ${shop.address}.`, 160);
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: base + '/' },
        { '@type': 'ListItem', position: 2, name: top.name, item: `${base}/danh-muc/${top.slug}/` },
        ...(sub ? [{ '@type': 'ListItem', position: 3, name: sub.name, item: url }] : []),
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: cur.name,
      itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/san-pham/${p.id}/`, name: p.name })),
    },
  ];
  const noscript = `<main><h1>${esc(cur.name)}</h1><p>${esc(cur.desc || '')}</p><ul>${products.map((p) => `<li><a href="/san-pham/${esc(p.id)}/">${esc(p.name)}</a></li>`).join('')}</ul></main>`;
  return renderShell(request, env, '/danh-muc/', { title, description: desc, canonical: url, siteName: shop.name, ld, noscript, seed: { category: cur.slug } });
}

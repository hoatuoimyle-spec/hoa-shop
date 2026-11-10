import { hydrateProduct } from '../_lib/util.js';
import { findCategory, topBySlug } from '../_lib/taxonomy.js';
import { renderShell, notFound, shopInfo, baseUrl, abs, clip, esc } from '../_lib/seo.js';

export async function onRequestGet({ request, env, params }) {
  const slug = String(params.slug || '').toLowerCase();
  const row = /^[a-z0-9-]{1,80}$/.test(slug) ? await env.DB.prepare('SELECT * FROM products WHERE id = ? AND active = 1').bind(slug).first() : null;
  if (!row) return notFound(request, env);

  const p = hydrateProduct(row);
  const base = baseUrl(request, env);
  const shop = await shopInfo(env);
  const url = `${base}/san-pham/${p.id}/`;
  const top = topBySlug(p.category);
  const sub = p.subcategory ? findCategory(p.subcategory)?.sub : null;
  const price = p.salePrice ?? p.price;
  const title = p.seoTitle || `${p.name} | ${shop.name}, Long Phú, Cần Thơ`;
  const desc = p.seoDescription || clip(p.description || `${p.name} tại ${shop.name}, ${shop.address}.`, 160);
  const img = abs(base, p.images[0]);

  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: clip(p.description, 300) || p.name,
      image: p.images.map((i) => abs(base, i)), sku: p.id, url,
      brand: { '@type': 'Brand', name: shop.name },
      offers: { '@type': 'Offer', url, priceCurrency: 'VND', price: String(price), availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', seller: { '@type': 'Organization', name: shop.name } },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: base + '/' },
        ...(top ? [{ '@type': 'ListItem', position: 2, name: top.name, item: `${base}/danh-muc/${top.slug}/` }] : []),
        ...(sub ? [{ '@type': 'ListItem', position: 3, name: sub.name, item: `${base}/danh-muc/${sub.slug}/` }] : []),
        { '@type': 'ListItem', position: 4, name: p.name, item: url },
      ],
    },
  ];
  const noscript = `<main><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p><p>Giá: ${price.toLocaleString('vi-VN')} đ</p>${p.dimensions ? `<p>Kích thước: ${esc(p.dimensions)}</p>` : ''}${p.materials ? `<p>Chất liệu: ${esc(p.materials)}</p>` : ''}<p>${esc(shop.name)} · ${esc(shop.address)}</p></main>`;

  return renderShell(request, env, '/san-pham/', { title, description: desc, canonical: url, image: img, siteName: shop.name, ogType: 'product', ld, noscript, seed: { product: p } });
}

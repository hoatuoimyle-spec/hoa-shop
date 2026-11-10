import { baseUrl } from './_lib/seo.js';

export async function onRequestGet({ request, env }) {
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /api/\n\nSitemap: ${baseUrl(request, env)}/sitemap.xml\n`;
  return new Response(txt, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

// Tiện ích dùng chung cho các Pages Functions.

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });

// Giờ Việt Nam (UTC+7) dưới dạng Date mà getUTC* cho ra giờ VN.
export const vnNow = () => new Date(Date.now() + 7 * 3600 * 1000);
export const vnDate = (d = vnNow()) => d.toISOString().slice(0, 10);
export const addDaysVn = (days) => vnDate(new Date(vnNow().getTime() + days * 86400000));

export function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const fmtVnd = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a, b) {
  const x = new TextEncoder().encode(String(a ?? ''));
  const y = new TextEncoder().encode(String(b ?? ''));
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function getSettings(db) {
  const { results } = await db.prepare('SELECT key, value FROM settings').all();
  const s = {};
  for (const r of results) s[r.key] = r.value;
  return s;
}

// Chuẩn hoá SĐT Việt Nam: +84/84 -> 0, bỏ ký tự lạ. Trả null nếu không hợp lệ.
export function normalizePhone(raw) {
  let d = String(raw ?? '').replace(/[^\d+]/g, '');
  if (d.startsWith('+84')) d = '0' + d.slice(3);
  else if (d.startsWith('84') && d.length === 11) d = '0' + d.slice(2);
  return /^0[35789]\d{8}$/.test(d) ? d : null;
}

export function parseJsonSafe(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function hydrateProduct(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory || '',
    price: r.price,
    salePrice: r.sale_price,
    images: parseJsonSafe(r.images, []),
    description: r.description,
    dimensions: r.dimensions,
    materials: r.materials,
    options: parseJsonSafe(r.options, []),
    leadDays: r.lead_days,
    inStock: !!r.in_stock,
    active: !!r.active,
    featured: !!r.featured,
    tags: parseJsonSafe(r.tags, []),
    sort: r.sort,
    seoTitle: r.seo_title || '',
    seoDescription: r.seo_description || '',
    updatedAt: r.updated_at || r.created_at || 0,
  };
}

export const TIME_SLOTS = ['Sáng 8h–11h', 'Trưa 11h–14h', 'Chiều 14h–17h', 'Tối 17h–20h'];

// Phần trăm cọc cho đơn "trả phần còn lại khi nhận hàng". Mặc định 50.
export function depositPercent(settings) {
  const n = parseInt(settings.deposit_percent, 10);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 50;
}

// Số tiền cọc, làm tròn LÊN đến nghìn đồng, không vượt quá tổng đơn.
export function depositFor(subtotal, pct) {
  if (pct <= 0) return 0;
  const raw = Math.ceil((subtotal * pct) / 100 / 1000) * 1000;
  return Math.min(subtotal, raw);
}

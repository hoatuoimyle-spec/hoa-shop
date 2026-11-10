import { json, hydrateProduct } from '../../_lib/util.js';
import { requireAdmin } from '../../_lib/auth.js';
import { validCategory } from '../../_lib/taxonomy.js';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateOptions(opts) {
  if (!Array.isArray(opts)) return 'options phải là mảng';
  if (opts.length > 6) return 'Tối đa 6 nhóm tuỳ chọn';
  for (const o of opts) {
    if (!o || typeof o.name !== 'string' || !o.name || !Array.isArray(o.choices) || o.choices.length < 1 || o.choices.length > 20) {
      return 'Mỗi nhóm tuỳ chọn cần tên và 1–20 lựa chọn';
    }
    for (const c of o.choices) {
      if (typeof c.label !== 'string' || !c.label || !Number.isInteger(c.delta)) {
        return 'Mỗi lựa chọn cần tên và mức chênh giá (số nguyên)';
      }
    }
  }
  return null;
}

// Ảnh chỉ nhận đường dẫn nội bộ (/api/media/..., /img/..., /images/...) hoặc https://
function validateImages(imgs) {
  if (!Array.isArray(imgs) || imgs.length > 8) return 'Tối đa 8 ảnh';
  for (const u of imgs) {
    if (typeof u !== 'string' || u.length > 300 || !(u.startsWith('/') && !u.startsWith('//') || u.startsWith('https://'))) {
      return 'Đường dẫn ảnh không hợp lệ';
    }
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY sort ASC, created_at DESC').all();
  return json({ products: results.map(hydrateProduct) });
}

// Thêm sản phẩm mới
export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const b = await request.json().catch(() => null);
  if (!b) return json({ error: 'JSON không hợp lệ' }, 400);

  if (!SLUG.test(b.id || '') || b.id.length > 80) return json({ error: 'Đường dẫn (id) chỉ gồm chữ thường không dấu, số và dấu gạch ngang, ví dụ bo-hoa-hong-do' }, 400);
  if (!b.name || String(b.name).length > 120) return json({ error: 'Thiếu tên sản phẩm' }, 400);
  if (!validCategory(b.category, b.subcategory || '')) return json({ error: 'Danh mục hoặc danh mục con không hợp lệ' }, 400);
  if (!Number.isInteger(b.price) || b.price < 0) return json({ error: 'Giá phải là số nguyên (VND)' }, 400);
  const opts = b.options ?? [];
  const e1 = validateOptions(opts);
  if (e1) return json({ error: e1 }, 400);
  const imgs = b.images ?? [];
  const e2 = validateImages(imgs);
  if (e2) return json({ error: e2 }, 400);

  try {
    await env.DB.prepare(
      `INSERT INTO products (id,name,category,subcategory,price,sale_price,images,description,dimensions,materials,options,lead_days,in_stock,active,featured,tags,sort,seo_title,seo_description)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
      .bind(
        b.id, String(b.name).slice(0, 120), b.category, b.subcategory || '', b.price,
        Number.isInteger(b.salePrice) ? b.salePrice : null,
        JSON.stringify(imgs),
        String(b.description ?? '').slice(0, 3000), String(b.dimensions ?? '').slice(0, 200),
        String(b.materials ?? '').slice(0, 300), JSON.stringify(opts),
        Number.isInteger(b.leadDays) && b.leadDays >= 0 && b.leadDays <= 60 ? b.leadDays : 0,
        b.inStock === false ? 0 : 1, b.active === false ? 0 : 1, b.featured ? 1 : 0,
        JSON.stringify(Array.isArray(b.tags) ? b.tags.slice(0, 10) : []),
        Number.isInteger(b.sort) ? b.sort : 100,
        String(b.seoTitle ?? '').slice(0, 80), String(b.seoDescription ?? '').slice(0, 200)
      )
      .run();
  } catch (e) {
    return json({ error: 'Không thêm được (đường dẫn id có thể đã tồn tại)' }, 409);
  }
  return json({ ok: true });
}

// Sửa sản phẩm (gửi lên những trường muốn đổi)
export async function onRequestPatch({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const b = await request.json().catch(() => null);
  if (!b || !b.id) return json({ error: 'Thiếu id' }, 400);

  const sets = [];
  const vals = [];
  const int = (key, col, min = 0, max = 1e9) => {
    if (b[key] === undefined) return null;
    if (b[key] === null && key === 'salePrice') { sets.push(`${col} = NULL`); return null; }
    if (!Number.isInteger(b[key]) || b[key] < min || b[key] > max) return `${key} không hợp lệ`;
    sets.push(`${col} = ?`); vals.push(b[key]); return null;
  };
  const flag = (key, col) => { if (b[key] !== undefined) { sets.push(`${col} = ?`); vals.push(b[key] ? 1 : 0); } };
  const str = (key, col, max) => { if (b[key] !== undefined) { sets.push(`${col} = ?`); vals.push(String(b[key]).slice(0, max)); } };

  const errs = [int('price', 'price'), int('salePrice', 'sale_price'), int('leadDays', 'lead_days', 0, 60), int('sort', 'sort', 0, 100000)].filter(Boolean);
  if (errs.length) return json({ error: errs[0] }, 400);
  flag('inStock', 'in_stock'); flag('active', 'active'); flag('featured', 'featured');
  str('name', 'name', 120); str('description', 'description', 3000);
  str('dimensions', 'dimensions', 200); str('materials', 'materials', 300);
  str('seoTitle', 'seo_title', 80); str('seoDescription', 'seo_description', 200);

  if (b.category !== undefined || b.subcategory !== undefined) {
    const cur = await env.DB.prepare('SELECT category, subcategory FROM products WHERE id = ?').bind(b.id).first();
    if (!cur) return json({ error: 'Không tìm thấy sản phẩm' }, 404);
    const cat = b.category ?? cur.category;
    const sub = b.subcategory ?? (b.category !== undefined ? '' : cur.subcategory);
    if (!validCategory(cat, sub)) return json({ error: 'Danh mục hoặc danh mục con không hợp lệ' }, 400);
    sets.push('category = ?', 'subcategory = ?'); vals.push(cat, sub);
  }
  if (b.options !== undefined) {
    const e = validateOptions(b.options);
    if (e) return json({ error: e }, 400);
    sets.push('options = ?'); vals.push(JSON.stringify(b.options));
  }
  if (b.images !== undefined) {
    const e = validateImages(b.images);
    if (e) return json({ error: e }, 400);
    sets.push('images = ?'); vals.push(JSON.stringify(b.images));
  }
  if (b.tags !== undefined) {
    if (!Array.isArray(b.tags)) return json({ error: 'tags phải là mảng' }, 400);
    sets.push('tags = ?'); vals.push(JSON.stringify(b.tags.slice(0, 10)));
  }
  if (!sets.length) return json({ error: 'Không có gì để sửa' }, 400);
  sets.push("updated_at = strftime('%s','now')");

  const r = await env.DB.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, b.id).run();
  if (!r.meta.changes) return json({ error: 'Không tìm thấy sản phẩm' }, 404);
  return json({ ok: true });
}

// Xoá hẳn sản phẩm (đơn cũ vẫn giữ nguyên vì đã lưu bản chụp tên và giá)
export async function onRequestDelete({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return json({ error: 'Thiếu id' }, 400);
  const r = await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  if (!r.meta.changes) return json({ error: 'Không tìm thấy sản phẩm' }, 404);
  return json({ ok: true });
}

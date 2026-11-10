import { json } from '../../_lib/util.js';
import { requireAdmin } from '../../_lib/auth.js';

const MAX_BYTES = 700 * 1024; // trình duyệt đã nén ảnh trước khi gửi; đây chỉ là chốt chặn

function sniff(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return null;
}

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// POST /api/admin/media  (body = nội dung ảnh) -> { url: "/api/media/<id>" }
export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const buf = new Uint8Array(await request.arrayBuffer());
  if (!buf.length) return json({ error: 'Không có dữ liệu ảnh' }, 400);
  if (buf.length > MAX_BYTES) return json({ error: 'Ảnh quá lớn sau khi nén' }, 413);
  const mime = sniff(buf);
  if (!mime) return json({ error: 'Chỉ nhận ảnh JPEG, PNG hoặc WebP' }, 415);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await env.DB.prepare('INSERT INTO media (id, mime, data) VALUES (?,?,?)').bind(id, mime, toBase64(buf)).run();
  return json({ ok: true, url: `/api/media/${id}` });
}

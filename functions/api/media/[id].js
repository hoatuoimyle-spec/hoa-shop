// GET /api/media/<id> -> ảnh đã tải lên từ trang quản trị
export async function onRequestGet({ params, env }) {
  const id = String(params.id || '');
  if (!/^[a-f0-9]{20}$/.test(id)) return new Response('Not found', { status: 404 });
  const row = await env.DB.prepare('SELECT mime, data FROM media WHERE id = ?').bind(id).first();
  if (!row) return new Response('Not found', { status: 404 });
  const bin = atob(row.data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: {
      'content-type': row.mime,
      // id không bao giờ đổi nội dung nên cache được vô thời hạn
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}

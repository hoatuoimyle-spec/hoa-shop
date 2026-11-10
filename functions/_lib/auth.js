import { json, timingSafeEqual } from './util.js';

// Trả về Response lỗi nếu không hợp lệ, hoặc null nếu được phép.
export function requireAdmin(request, env) {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 16) {
    return json({ error: 'ADMIN_TOKEN chưa được cấu hình (cần tối thiểu 16 ký tự)' }, 503);
  }
  const h = request.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!timingSafeEqual(token, env.ADMIN_TOKEN)) return json({ error: 'Unauthorized' }, 401);
  return null;
}

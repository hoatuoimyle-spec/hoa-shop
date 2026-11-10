import { json } from '../../_lib/util.js';
import { requireAdmin } from '../../_lib/auth.js';
import { sendOrderToTelegram } from '../../_lib/telegram.js';

// POST /api/admin/retry-telegram
// Gửi lại các đơn chưa đẩy được vào Telegram. Có thể gọi định kỳ 5 phút/lần
// bằng một dịch vụ cron miễn phí (ví dụ cron-job.org) kèm header Authorization.
export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const { results } = await env.DB.prepare(
    "SELECT * FROM orders WHERE tg_sent = 0 AND status = 'new' ORDER BY id ASC LIMIT 20"
  ).all();
  let sent = 0;
  for (const o of results) if (await sendOrderToTelegram(env, o)) sent++;
  return json({ ok: true, pending: results.length, sent });
}

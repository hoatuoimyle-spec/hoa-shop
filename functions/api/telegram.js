import { json, timingSafeEqual } from '../_lib/util.js';
import { tg, orderText, orderKeyboard, STATUS_LABEL } from '../_lib/telegram.js';

// Telegram gọi vào đây khi bạn bấm nút trên tin nhắn đơn hàng.
// Đăng ký bằng setWebhook kèm secret_token (xem README).
export async function onRequestPost({ request, env }) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token') || '';
  if (!env.TELEGRAM_WEBHOOK_SECRET || !timingSafeEqual(secret, env.TELEGRAM_WEBHOOK_SECRET)) {
    return json({ error: 'forbidden' }, 403);
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return json({ ok: true });
  }

  const cq = update.callback_query;
  if (!cq || typeof cq.data !== 'string') return json({ ok: true });

  const answer = (text, alert = false) =>
    tg(env, 'answerCallbackQuery', { callback_query_id: cq.id, text, show_alert: alert });

  // Chỉ nhận thao tác từ đúng chat nhận đơn của bạn.
  const chatId = String(cq.message?.chat?.id ?? '');
  if (chatId !== String(env.TELEGRAM_CHAT_ID)) {
    await answer('Không có quyền', true);
    return json({ ok: true });
  }

  const sm = /^s:([A-Za-z0-9-]+):(confirmed|making|delivered|cancelled)$/.exec(cq.data);
  const dm = /^d:([A-Za-z0-9-]+):([01])$/.exec(cq.data);
  if (!sm && !dm) {
    await answer('Lệnh không hợp lệ');
    return json({ ok: true });
  }
  const code = (sm || dm)[1];

  const order = await env.DB.prepare('SELECT * FROM orders WHERE code = ?').bind(code).first();
  if (!order) {
    await answer('Không tìm thấy đơn', true);
    return json({ ok: true });
  }
  if (order.status === 'delivered' || order.status === 'cancelled') {
    await answer(`Đơn đã ở trạng thái "${STATUS_LABEL[order.status]}", không đổi nữa`, true);
    return json({ ok: true });
  }

  let updated;
  let toast;
  if (sm) {
    const status = sm[2];
    await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, order.id).run();
    updated = { ...order, status };
    toast = STATUS_LABEL[status];
  } else {
    const paid = Number(dm[2]);
    await env.DB.prepare('UPDATE orders SET deposit_paid = ? WHERE id = ?').bind(paid, order.id).run();
    updated = { ...order, deposit_paid: paid };
    toast = paid ? '💵 Đã ghi nhận cọc' : '↩ Đã bỏ dấu nhận cọc';
  }

  await tg(env, 'editMessageText', {
    chat_id: cq.message.chat.id,
    message_id: cq.message.message_id,
    text: orderText(updated),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: orderKeyboard(updated),
  });
  await answer(toast);
  return json({ ok: true });
}

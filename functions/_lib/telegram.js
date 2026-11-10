import { escHtml, fmtVnd, parseJsonSafe } from './util.js';

export const STATUS_LABEL = {
  new: '🆕 Mới',
  confirmed: '✅ Đã xác nhận',
  making: '🛠 Đang làm',
  delivered: '🚚 Đã giao',
  cancelled: '❌ Đã hủy',
};

// TELEGRAM_API_BASE chỉ dùng khi chạy thử cục bộ với máy chủ giả.
export async function tg(env, method, body) {
  const base = env.TELEGRAM_API_BASE || 'https://api.telegram.org';
  try {
    const r = await fetch(`${base}/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, description: String(e) };
  }
}

function paymentLines(o) {
  const dep = Number(o.deposit_amount || 0);
  // Đơn cũ (trước khi có tính năng cọc)
  if (!dep) return [`💳 ${o.payment_method === 'bank' ? 'Chuyển khoản' : 'COD (thu tiền khi giao)'}`];

  const paid = o.deposit_paid ? '✅ ĐÃ NHẬN' : '⏳ CHƯA NHẬN';
  if (o.payment_method === 'bank') {
    return [`💳 Chuyển khoản toàn bộ: <b>${fmtVnd(dep)}</b> – ${paid}`];
  }
  const pct = o.subtotal ? Math.round((dep / o.subtotal) * 100) : 0;
  return [
    `💳 Cọc ${pct}%: <b>${fmtVnd(dep)}</b> – ${paid}`,
    `💵 Thu khi giao: <b>${fmtVnd(o.subtotal - dep)}</b>`,
  ];
}

export function orderText(o) {
  const items = parseJsonSafe(o.items_json, []);
  const lines = items.map((it) => {
    const opts = Object.values(it.options || {}).join(', ');
    return `• ${escHtml(it.name)}${opts ? ` (${escHtml(opts)})` : ''} x${it.qty} – ${fmtVnd(it.line)}`;
  });
  const parts = [
    `🌸 <b>ĐƠN #${escHtml(o.code)}</b>`,
    `👤 ${escHtml(o.customer_name)} | 📞 ${escHtml(o.phone)}`,
    `📍 ${escHtml(o.address)}`,
    `🕒 Giao: ${escHtml(o.delivery_date)} (${escHtml(o.time_slot)})`,
    '',
    '🛒',
    ...lines,
    '',
    `💰 Tạm tính: <b>${fmtVnd(o.subtotal)}</b> (chưa gồm phí ship)`,
    ...paymentLines(o),
  ];
  if (o.card_message) parts.push(`💌 Thiệp: "${escHtml(o.card_message)}"`);
  if (o.note) parts.push(`📝 Ghi chú: ${escHtml(o.note)}`);
  parts.push('', `Trạng thái: <b>${STATUS_LABEL[o.status] || o.status}</b>`);
  return parts.join('\n');
}

export function orderKeyboard(o) {
  const rows = [];
  const open = o.status !== 'delivered' && o.status !== 'cancelled';
  if (open) {
    if (Number(o.deposit_amount || 0) > 0) {
      rows.push([
        o.deposit_paid
          ? { text: '↩ Bỏ dấu đã nhận cọc', callback_data: `d:${o.code}:0` }
          : { text: '💵 Đã nhận cọc', callback_data: `d:${o.code}:1` },
      ]);
    }
    rows.push([
      { text: '✅ Xác nhận', callback_data: `s:${o.code}:confirmed` },
      { text: '🛠 Đang làm', callback_data: `s:${o.code}:making` },
    ]);
    rows.push([
      { text: '🚚 Đã giao', callback_data: `s:${o.code}:delivered` },
      { text: '❌ Hủy', callback_data: `s:${o.code}:cancelled` },
    ]);
  }
  rows.push([
    {
      text: '🗺 Bản đồ',
      url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(o.address),
    },
    { text: '💬 Zalo khách', url: `https://zalo.me/${o.phone}` },
  ]);
  return { inline_keyboard: rows };
}

// Gửi đơn vào Telegram và ghi lại kết quả vào DB. Không ném lỗi.
export async function sendOrderToTelegram(env, order) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  const res = await tg(env, 'sendMessage', {
    chat_id: env.TELEGRAM_CHAT_ID,
    text: orderText(order),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: orderKeyboard(order),
  });
  if (res && res.ok) {
    await env.DB.prepare('UPDATE orders SET tg_sent = 1, tg_message_id = ? WHERE id = ?')
      .bind(res.result.message_id, order.id)
      .run();
    return true;
  }
  return false;
}

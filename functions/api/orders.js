import {
  json,
  getSettings,
  normalizePhone,
  depositFor,
  depositPercent,
  parseJsonSafe,
  sha256,
  vnNow,
  vnDate,
  addDaysVn,
  TIME_SLOTS,
} from '../_lib/util.js';
import { sendOrderToTelegram } from '../_lib/telegram.js';

const MAX_PER_IP_HOUR = 6;
const MAX_PER_PHONE_HOUR = 3;

async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // chưa bật captcha
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const d = await r.json();
    return !!d.success;
  } catch {
    return false;
  }
}

// YYYY-MM-DD phải là ngày có thật trên lịch (loại 2026-13-45, 2026-02-30...).
function isRealDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);
const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad('Dữ liệu không hợp lệ');
  }

  // Honeypot: bot hay điền ô này. Trả về "thành công" giả để bot không dò được.
  if (body.website) return json({ ok: true, code: 'HX-000000-0', total: 0 });

  const settings = await getSettings(env.DB);
  if (settings.accepting_orders === '0') {
    return bad(settings.notice || 'Cửa hàng tạm ngưng nhận đơn trên web. Vui lòng gọi trực tiếp.', 503);
  }

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'local';
  if (!(await verifyTurnstile(env, body.turnstileToken, ip))) {
    return bad('Xác minh chống spam không thành công, vui lòng thử lại');
  }

  // --- Kiểm tra thông tin khách ---
  const name = clean(body.name, 80);
  const phone = normalizePhone(body.phone);
  const address = clean(body.address, 300);
  const slot = clean(body.timeSlot, 40);
  const payment = body.payment === 'bank' ? 'bank' : 'cod';
  const cardMessage = clean(body.cardMessage, 200);
  const note = clean(body.note, 300);
  const deliveryDate = clean(body.deliveryDate, 10);

  if (name.length < 2) return bad('Vui lòng nhập họ tên');
  if (!phone) return bad('Số điện thoại không hợp lệ (ví dụ 0901234567)');
  if (address.length < 8) return bad('Vui lòng nhập địa chỉ giao hàng đầy đủ');
  if (!TIME_SLOTS.includes(slot)) return bad('Vui lòng chọn khung giờ nhận hàng');
  if (!isRealDate(deliveryDate)) return bad('Vui lòng chọn ngày nhận hàng hợp lệ');

  // --- Giới hạn tần suất (theo IP và SĐT) ---
  const ipHash = await sha256(ip + (env.IP_SALT || 'hoa-shop'));
  const since = Math.floor(Date.now() / 1000) - 3600;
  const byIp = await env.DB.prepare('SELECT COUNT(*) AS c FROM orders WHERE ip_hash = ? AND created_at > ?')
    .bind(ipHash, since)
    .first();
  if (byIp.c >= MAX_PER_IP_HOUR) return bad('Bạn đặt quá nhiều đơn trong thời gian ngắn, vui lòng gọi cửa hàng.', 429);
  const byPhone = await env.DB.prepare('SELECT COUNT(*) AS c FROM orders WHERE phone = ? AND created_at > ?')
    .bind(phone, since)
    .first();
  if (byPhone.c >= MAX_PER_PHONE_HOUR) return bad('Số điện thoại này đã đặt nhiều đơn gần đây, vui lòng gọi cửa hàng.', 429);

  // --- Giỏ hàng: tính lại toàn bộ giá từ database ---
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length < 1 || rawItems.length > 30) return bad('Giỏ hàng trống hoặc quá lớn');

  const ids = [...new Set(rawItems.map((i) => String(i.id ?? '')))];
  const ph = ids.map(() => '?').join(',');
  const { results: prodRows } = await env.DB.prepare(`SELECT * FROM products WHERE id IN (${ph})`)
    .bind(...ids)
    .all();
  const byId = new Map(prodRows.map((p) => [p.id, p]));

  const items = [];
  let subtotal = 0;
  let maxLead = 0;
  for (const raw of rawItems) {
    const p = byId.get(String(raw.id ?? ''));
    if (!p || !p.active) return bad('Có sản phẩm không còn bán, vui lòng tải lại trang');
    if (!p.in_stock) return bad(`"${p.name}" hiện đã hết hàng`);
    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return bad('Số lượng không hợp lệ');

    const options = parseJsonSafe(p.options, []);
    const chosen = {};
    let unit = p.sale_price ?? p.price;
    for (const opt of options) {
      const label = raw.options && raw.options[opt.name];
      const choice = opt.choices.find((c) => c.label === label);
      if (!choice) return bad(`Vui lòng chọn "${opt.name}" cho "${p.name}"`);
      chosen[opt.name] = choice.label;
      unit += choice.delta;
    }
    const line = unit * qty;
    subtotal += line;
    maxLead = Math.max(maxLead, p.lead_days);
    items.push({ id: p.id, name: p.name, qty, unit, options: chosen, line });
  }

  // --- Tiền cọc ---
  // 'cod'  : cọc theo phần trăm (mặc định 50%), phần còn lại thu khi nhận hàng.
  // 'bank' : chuyển khoản toàn bộ.
  const pct = depositPercent(settings);
  const deposit = payment === 'bank' ? subtotal : depositFor(subtotal, pct);

  // --- Ngày giao: tôn trọng thời gian chuẩn bị của sản phẩm ---
  let lead = maxLead;
  if (lead === 0 && vnNow().getUTCHours() >= Number(settings.same_day_cutoff_hour || 15)) lead = 1;
  const minDate = addDaysVn(lead);
  const maxDate = addDaysVn(120);
  if (deliveryDate < minDate) {
    return bad(`Sản phẩm trong giỏ cần đặt trước, ngày nhận sớm nhất là ${minDate}`);
  }
  if (deliveryDate > maxDate) return bad('Ngày nhận hàng quá xa');

  // --- Giới hạn số đơn/ngày (mùa Tết) ---
  const dailyLimit = Number(settings.daily_order_limit || 0);
  if (dailyLimit > 0) {
    const day = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM orders WHERE delivery_date = ? AND status != 'cancelled'"
    )
      .bind(deliveryDate)
      .first();
    if (day.c >= dailyLimit) return bad('Ngày này đã đủ số đơn, vui lòng chọn ngày khác');
  }

  // --- Lưu đơn trước, gửi Telegram sau ---
  const tmp = 'tmp-' + crypto.randomUUID();
  const ins = await env.DB.prepare(
    `INSERT INTO orders (code, customer_name, phone, address, delivery_date, time_slot, card_message, note,
       payment_method, items_json, subtotal, deposit_amount, ip_hash)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  )
    .bind(tmp, name, phone, address, deliveryDate, slot, cardMessage, note, payment, JSON.stringify(items), subtotal, deposit, ipHash)
    .run();
  const id = ins.meta.last_row_id;
  const code = `HX-${vnDate().slice(2).replace(/-/g, '')}-${id}`;
  await env.DB.prepare('UPDATE orders SET code = ? WHERE id = ?').bind(code, id).run();

  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  const sent = await sendOrderToTelegram(env, order);

  // Dù Telegram lỗi, đơn vẫn nằm trong DB (tg_sent = 0) và sẽ được gửi lại.
  return json({
    ok: true,
    code,
    total: subtotal,
    payment,
    deposit,
    remaining: subtotal - deposit,
    notified: sent,
  });
}

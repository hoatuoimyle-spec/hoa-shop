import { json, parseJsonSafe } from '../../_lib/util.js';
import { requireAdmin } from '../../_lib/auth.js';

// GET /api/admin/orders?limit=50&status=new
export async function onRequestGet({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 200);
  const status = url.searchParams.get('status');
  const where = ['new', 'confirmed', 'making', 'delivered', 'cancelled'].includes(status) ? 'WHERE status = ?' : '';
  const stmt = env.DB.prepare(`SELECT * FROM orders ${where} ORDER BY id DESC LIMIT ?`);
  const { results } = await (where ? stmt.bind(status, limit) : stmt.bind(limit)).all();
  return json({
    orders: results.map((o) => ({
      code: o.code, name: o.customer_name, phone: o.phone, address: o.address,
      deliveryDate: o.delivery_date, timeSlot: o.time_slot, payment: o.payment_method,
      subtotal: o.subtotal, depositAmount: o.deposit_amount, depositPaid: !!o.deposit_paid,
      status: o.status, telegramSent: !!o.tg_sent,
      items: parseJsonSafe(o.items_json, []), cardMessage: o.card_message, note: o.note,
      createdAt: o.created_at,
    })),
  });
}

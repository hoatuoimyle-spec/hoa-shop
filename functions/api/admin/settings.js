import { json, getSettings } from '../../_lib/util.js';
import { requireAdmin } from '../../_lib/auth.js';

const ALLOWED = [
  'shop_name', 'shop_phone', 'zalo', 'shop_address', 'accepting_orders', 'notice',
  'daily_order_limit', 'same_day_cutoff_hour', 'ship_note', 'bank_info',
  'deposit_percent', 'bank_bin', 'bank_account', 'bank_account_name',
  'opening_hours', 'facebook_url', 'tiktok_url',
];

export async function onRequestGet({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  return json({ settings: await getSettings(env.DB) });
}

export async function onRequestPut({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== 'object') return json({ error: 'JSON không hợp lệ' }, 400);
  const stmts = [];
  for (const [k, v] of Object.entries(b)) {
    if (!ALLOWED.includes(k)) continue;
    stmts.push(
      env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
        .bind(k, String(v).slice(0, 500))
    );
  }
  if (!stmts.length) return json({ error: 'Không có khoá hợp lệ' }, 400);
  await env.DB.batch(stmts);
  return json({ ok: true });
}

import { json, getSettings, hydrateProduct, depositPercent, TIME_SLOTS } from '../_lib/util.js';

// GET /api/products -> danh sách sản phẩm đang bán + cài đặt công khai
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM products WHERE active = 1 ORDER BY sort ASC, created_at DESC'
  ).all();
  const s = await getSettings(env.DB);
  return json(
    {
      settings: {
        shopName: s.shop_name || '',
        shopPhone: s.shop_phone || '',
        zalo: s.zalo || '',
        shopAddress: s.shop_address || '',
        acceptingOrders: s.accepting_orders !== '0',
        notice: s.notice || '',
        shipNote: s.ship_note || '',
        bankInfo: s.bank_info || '',
        bankBin: s.bank_bin || '',
        bankAccount: s.bank_account || '',
        bankAccountName: s.bank_account_name || '',
        depositPercent: depositPercent(s),
        sameDayCutoffHour: Number(s.same_day_cutoff_hour || 15),
        turnstileSiteKey: env.TURNSTILE_SITEKEY || '',
        hours: s.opening_hours || '',
        facebookUrl: s.facebook_url || '',
        tiktokUrl: s.tiktok_url || '',
        timeSlots: TIME_SLOTS,
      },
      products: results.map(hydrateProduct),
    },
    200,
    { 'cache-control': 'public, max-age=30' }
  );
}

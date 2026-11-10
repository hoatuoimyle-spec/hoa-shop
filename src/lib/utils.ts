// src/lib/utils.ts — Tiện ích chung
import type { Product } from './types';

export const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export const normalizeVietnamese = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

export const baseOf = (p: Product) => p.salePrice ?? p.price;

export const unitOf = (p: Product, opts: Record<string, string>) =>
  p.options.reduce((sum, o) => {
    const c = o.choices.find((x) => x.label === opts[o.name]);
    return sum + (c ? c.delta : 0);
  }, baseOf(p));

export const minUnit = (p: Product) =>
  baseOf(p) + p.options.reduce((s, o) => s + Math.min(...o.choices.map((c) => c.delta)), 0);

export const hasPriceRange = (p: Product) =>
  p.options.some((o) => new Set(o.choices.map((c) => c.delta)).size > 1);

// Mặc định chọn phương án giá chuẩn (delta = 0), nếu không có thì phương án đầu.
export function defaultOptions(p: Product): Record<string, string> {
  const o: Record<string, string> = {};
  for (const opt of p.options) {
    const std = opt.choices.find((c) => c.delta === 0) ?? opt.choices[0];
    o[opt.name] = std.label;
  }
  return o;
}

// Tiền cọc: làm tròn LÊN đến nghìn đồng (khớp server; server mới là nơi quyết định).
export function depositFor(total: number, pct: number) {
  if (pct <= 0) return 0;
  return Math.min(total, Math.ceil((total * pct) / 100 / 1000) * 1000);
}

// ---- Ngày giờ Việt Nam ----
const TZ = 'Asia/Ho_Chi_Minh';
export const vnToday = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
export const vnHour = () =>
  Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TZ }).format(new Date()));
export const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
export const viDate = (iso: string) => iso.split('-').reverse().join('/');

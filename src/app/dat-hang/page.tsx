// src/app/dat-hang/page.tsx — Giỏ hàng và đặt hàng (gửi /api/orders)
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useCartStore } from '@/lib/store';
import { useCatalog } from '@/components/CatalogProvider';
import OrderSuccess from '@/components/OrderSuccess';
import Turnstile from '@/components/Turnstile';
import ProductImage from '@/components/ProductImage';
import type { OrderResult } from '@/lib/types';
import { addDays, depositFor, formatVND, viDate, vnHour, vnToday } from '@/lib/utils';

type Payment = 'cod' | 'bank';

export default function OrderPage() {
  const { data, error, reload, settings, lines, cartTotal, missing } = useCatalog();
  const { setQty, removeAt, clearCart } = useCartStore();

  const [form, setForm] = useState({ name: '', phone: '', address: '', deliveryDate: '', timeSlot: '', cardMessage: '', note: '', website: '' });
  const [payment, setPayment] = useState<Payment>('cod');
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<{ r: OrderResult; phone: string } | null>(null);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('cust') || '{}');
      setForm((f) => ({ ...f, name: c.name || '', phone: c.phone || '', address: c.address || '' }));
    } catch { /* bỏ qua */ }
  }, []);

  const pct = settings?.depositPercent ?? 50;
  const deposit = payment === 'bank' ? cartTotal : depositFor(cartTotal, pct);
  const remaining = cartTotal - deposit;

  // Ngày nhận sớm nhất theo thời gian chuẩn bị của sản phẩm trong giỏ
  const minDate = useMemo(() => {
    if (!settings) return '';
    let lead = lines.reduce((m, l) => Math.max(m, l.p.leadDays), 0);
    if (lead === 0 && vnHour() >= (settings.sameDayCutoffHour || 15)) lead = 1;
    return addDays(vnToday(), lead);
  }, [lines, settings]);

  useEffect(() => {
    if (!settings || !minDate) return;
    setForm((f) => ({ ...f, deliveryDate: !f.deliveryDate || f.deliveryDate < minDate ? minDate : f.deliveryDate, timeSlot: f.timeSlot || settings.timeSlots[0] || '' }));
  }, [settings, minDate]);

  const onToken = useCallback((t: string) => setToken(t), []);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setErr('');
    setBusy(true);
    try {
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, payment, turnstileToken: token, items: lines.map((l) => ({ id: l.p.id, options: l.options, qty: l.qty })) }),
      });
      const d: any = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || 'Không gửi được đơn, vui lòng thử lại hoặc gọi cửa hàng');
      try { localStorage.setItem('cust', JSON.stringify({ name: form.name, phone: form.phone, address: form.address })); } catch { /* bỏ qua */ }
      clearCart();
      setResult({ r: d as OrderResult, phone: form.phone });
      window.scrollTo({ top: 0 });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Có lỗi xảy ra');
      setResetKey((k) => k + 1);
      setToken('');
    } finally {
      setBusy(false);
    }
  }

  if (result && settings) return <OrderSuccess result={result.r} settings={settings} phone={result.phone} />;
  if (!data && !error) return <div className="container page-pad muted">Đang tải…</div>;
  if (error) return <div className="container page-pad"><p>Không tải được dữ liệu. <button type="button" className="link-btn" onClick={reload}>Thử lại</button></p></div>;
  if (!settings) return null;

  if (lines.length === 0) {
    return (
      <div className="container page-pad" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Giỏ hàng đang trống</h1>
        <p className="page-lead">Chọn một mẫu giỏ quà hoặc hoa để bắt đầu.</p>
        <a href="/" className="btn btn-primary">Xem sản phẩm</a>
      </div>
    );
  }

  const closed = !settings.acceptingOrders;
  const hasLead = lines.some((l) => l.p.leadDays > 0);

  return (
    <div className="order-page">
      <div className="container">
        <form className="order-grid" onSubmit={submit} noValidate>
          <div className="order-form">
            <h2>Giỏ hàng và thông tin nhận hàng</h2>
            {closed && <div className="form-alert">{settings.notice || 'Cửa hàng tạm ngưng nhận đơn trên web. Vui lòng gọi trực tiếp.'}</div>}
            {missing > 0 && <div className="form-alert">Có {missing} sản phẩm trong giỏ không còn bán và đã được bỏ qua.</div>}

            <ul className="order-lines">
              {lines.map((l) => (
                <li key={l.p.id + JSON.stringify(l.options)}>
                  <div className="cart-item-thumb"><ProductImage src={l.p.images[0]} alt={l.p.name} /></div>
                  <div className="order-line-info">
                    <a href={`/san-pham/${l.p.id}/`}>{l.p.name}</a>
                    {Object.values(l.options).length > 0 && <small>{Object.values(l.options).join(' · ')}</small>}
                    <div className="order-line-ctl">
                      <div className="qty">
                        <button type="button" aria-label="Giảm" onClick={() => setQty(l.index, l.qty - 1)}>−</button>
                        <span>{l.qty}</span>
                        <button type="button" aria-label="Tăng" onClick={() => setQty(l.index, l.qty + 1)}>+</button>
                      </div>
                      <button type="button" className="link-btn" onClick={() => removeAt(l.index)}>Xóa</button>
                    </div>
                  </div>
                  <strong>{formatVND(l.line)}</strong>
                </li>
              ))}
            </ul>

            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
            <div className="form-group"><label htmlFor="name">Họ tên <span className="req">*</span></label><input id="name" autoComplete="name" required maxLength={80} value={form.name} onChange={set('name')} /></div>
            <div className="form-group"><label htmlFor="phone">Số điện thoại <span className="req">*</span></label><input id="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0901234567" value={form.phone} onChange={set('phone')} /></div>
            <div className="form-group"><label htmlFor="address">Địa chỉ giao hàng <span className="req">*</span></label><textarea id="address" autoComplete="street-address" required maxLength={300} rows={3} placeholder="Số nhà, ấp/đường, xã/phường, huyện/quận, tỉnh/thành" value={form.address} onChange={set('address')} /></div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Ngày nhận</label>
                <input id="date" type="date" required min={minDate} value={form.deliveryDate} onChange={set('deliveryDate')} />
                {hasLead && <small className="muted">Có sản phẩm cần đặt trước, sớm nhất {viDate(minDate)}.</small>}
              </div>
              <div className="form-group">
                <label htmlFor="slot">Khung giờ</label>
                <select id="slot" value={form.timeSlot} onChange={set('timeSlot')}>{settings.timeSlots.map((t) => <option key={t}>{t}</option>)}</select>
              </div>
            </div>
            <div className="form-group"><label htmlFor="card">Lời nhắn trên thiệp (nếu có)</label><textarea id="card" maxLength={200} rows={2} value={form.cardMessage} onChange={set('cardMessage')} /></div>
            <div className="form-group"><label htmlFor="note">Ghi chú cho cửa hàng</label><textarea id="note" maxLength={300} rows={2} placeholder="Ví dụ: gọi trước khi giao" value={form.note} onChange={set('note')} /></div>
          </div>

          <aside className="order-summary">
            <h3>Thanh toán</h3>
            <fieldset className="pay-options">
              <legend className="sr-only">Hình thức thanh toán</legend>
              <label className={`pay-option ${payment === 'cod' ? 'on' : ''}`}>
                <input type="radio" name="payment" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                <span><b>{pct > 0 ? `Đặt cọc ${pct}%, trả phần còn lại khi nhận hàng` : 'Trả tiền khi nhận hàng'}</b>
                  <small>Chuyển {formatVND(depositFor(cartTotal, pct))} ngay, còn {formatVND(cartTotal - depositFor(cartTotal, pct))} trả khi nhận.</small></span>
              </label>
              <label className={`pay-option ${payment === 'bank' ? 'on' : ''}`}>
                <input type="radio" name="payment" checked={payment === 'bank'} onChange={() => setPayment('bank')} />
                <span><b>Chuyển khoản toàn bộ</b><small>Thanh toán {formatVND(cartTotal)} một lần.</small></span>
              </label>
            </fieldset>

            <div className="summary-items">
              <div className="summary-item"><span>Tạm tính</span><span>{formatVND(cartTotal)}</span></div>
              <div className="summary-item"><span>Phí giao hàng</span><span>Báo khi xác nhận</span></div>
            </div>
            <div className="summary-total"><span>Chuyển ngay</span><strong>{formatVND(deposit)}</strong></div>
            {remaining > 0 && <div className="summary-item"><span>Trả khi nhận hàng</span><span>{formatVND(remaining)}</span></div>}
            {settings.shipNote && <p className="summary-note">{settings.shipNote}</p>}

            <Turnstile siteKey={settings.turnstileSiteKey} onToken={onToken} resetKey={resetKey} />
            {err && <div className="form-alert" role="alert">{err}</div>}
            <button type="submit" disabled={busy || closed} className="btn btn-primary btn-lg btn-block">{busy ? 'Đang gửi…' : 'Đặt hàng'}</button>
            <p className="summary-note">Bằng việc đặt hàng, bạn đồng ý với <Link href="/chinh-sach/">chính sách đặt hàng và đặt cọc</Link>.</p>
          </aside>
        </form>
      </div>
    </div>
  );
}

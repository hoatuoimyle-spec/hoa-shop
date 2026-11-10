// src/components/OrderSuccess.tsx — Sau khi đặt: mã đơn, số tiền cọc, QR VietQR
'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { OrderResult, Settings } from '@/lib/types';
import { formatVND } from '@/lib/utils';

function CopyRow({ label, value, copy }: { label: string; value: string; copy?: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="copy-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
      <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(copy ?? value); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* bỏ qua */ } }}>
        {done ? 'Đã chép' : 'Chép'}
      </button>
    </div>
  );
}

export default function OrderSuccess({ result, settings, phone }: { result: OrderResult; settings: Settings; phone: string }) {
  const [qrFailed, setQrFailed] = useState(false);
  const hasBank = !!(settings.bankBin && settings.bankAccount);
  // Số tiền lấy từ máy chủ (result.deposit), không tính lại ở trình duyệt
  const qr = hasBank
    ? `https://img.vietqr.io/image/${encodeURIComponent(settings.bankBin)}-${encodeURIComponent(settings.bankAccount)}-compact2.png?amount=${result.deposit}&addInfo=${encodeURIComponent(result.code)}${settings.bankAccountName ? `&accountName=${encodeURIComponent(settings.bankAccountName)}` : ''}`
    : '';

  return (
    <div className="order-page">
      <div className="container">
        <div className="order-success">
          <h2>Đã nhận đơn của bạn</h2>
          <p>Mã đơn: <span className="order-id">{result.code}</span></p>

          {result.deposit > 0 ? (
            <div className="qr-block">
              <h4>{result.payment === 'bank' ? 'Chuyển khoản toàn bộ' : 'Đặt cọc'}: {formatVND(result.deposit)}</h4>
              {result.remaining > 0 && <p>Còn lại {formatVND(result.remaining)} thanh toán cho người giao khi nhận hàng.</p>}
              {hasBank && !qrFailed && (
                <div className="qr-image-wrap"><img src={qr} alt="Mã QR chuyển khoản" onError={() => setQrFailed(true)} /></div>
              )}
              {hasBank ? (
                <dl className="copy-list">
                  <CopyRow label="Ngân hàng" value={settings.bankBin} />
                  <CopyRow label="Số tài khoản" value={settings.bankAccount} />
                  {settings.bankAccountName && <CopyRow label="Chủ tài khoản" value={settings.bankAccountName} />}
                  <CopyRow label="Số tiền" value={formatVND(result.deposit)} copy={String(result.deposit)} />
                  <CopyRow label="Nội dung" value={result.code} />
                </dl>
              ) : settings.bankInfo ? (
                <p style={{ whiteSpace: 'pre-line' }}>{settings.bankInfo}</p>
              ) : (
                <p>Cửa hàng sẽ gửi thông tin chuyển khoản qua điện thoại hoặc Zalo số <b>{phone}</b> khi gọi xác nhận.</p>
              )}
              <p className="muted">Ghi đúng nội dung <b>{result.code}</b> để cửa hàng đối chiếu. Cửa hàng bắt đầu chuẩn bị sau khi nhận được tiền.</p>
            </div>
          ) : (
            <p>Cửa hàng sẽ gọi số <b>{phone}</b> để xác nhận đơn.</p>
          )}

          <p>Cửa hàng sẽ gọi số <b>{phone}</b> để xác nhận và báo phí giao hàng. Cần đổi thông tin, hãy gọi hoặc nhắn Zalo kèm mã đơn.</p>
          <div className="order-success-actions">
            {settings.shopPhone && <a className="btn btn-primary" href={`tel:${settings.shopPhone}`}>Gọi cửa hàng</a>}
            {settings.zalo && <a className="btn btn-ghost" href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noopener">Nhắn Zalo</a>}
            <Link href="/" className="btn btn-ghost">Về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

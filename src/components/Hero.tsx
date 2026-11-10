// src/components/Hero.tsx — Phần đầu trang chủ (nội dung thật của tiệm, không số liệu quảng cáo)
'use client';

import { useCatalog } from './CatalogProvider';
import { FOUNDED, SHOP_NAME } from '@/data/site';

export default function Hero() {
  const { settings } = useCatalog();
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" className="hero-svg">
          <defs>
            <radialGradient id="heroGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F5EBDC" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#E5D5BA" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#D9C4A0" stopOpacity="0.4" />
            </radialGradient>
          </defs>
          <rect width="1440" height="800" fill="url(#heroGlow)" />
          <g opacity="0.16" fill="#1B2A4E">
            <g transform="translate(220 190)">{[0, 72, 144, 216, 288].map((a) => (<ellipse key={a} cx="0" cy="-32" rx="15" ry="24" transform={`rotate(${a})`} />))}<circle r="10" fill="#B22222" /></g>
            <g transform="translate(1230 620)">{[0, 72, 144, 216, 288].map((a) => (<ellipse key={a} cx="0" cy="-38" rx="17" ry="28" transform={`rotate(${a})`} opacity="0.7" />))}<circle r="12" fill="#B22222" opacity="0.7" /></g>
          </g>
        </svg>
      </div>
      <div className="hero-content">
        <div className="hero-badge">{settings?.shopName || SHOP_NAME} · Từ năm {FOUNDED}</div>
        <h1 className="hero-title">
          Quà Tết, hoa tươi, hoa sáp, hoa lụa<br />
          <span className="hero-title-accent">làm theo ý bạn</span>
        </h1>
        <p className="hero-sub">Thiết kế giỏ quà Tết, hoa và bánh kẹo decor theo ngân sách và yêu cầu riêng, cho gia đình và doanh nghiệp tại Long Phú, Cần Thơ.</p>
        <div className="hero-cta">
          <a href="/danh-muc/gio-qua-tet/" className="btn btn-primary btn-lg">Xem giỏ quà Tết</a>
          <a href="/danh-muc/hoa-tuoi/" className="btn btn-ghost btn-lg">Chọn hoa tươi</a>
        </div>
        <ul className="hero-facts">
          <li>Đặt cọc {settings?.depositPercent ?? 50}% để giữ đơn</li>
          <li>Cửa hàng gọi xác nhận trước khi làm</li>
          <li>Chọn ngày giờ nhận hàng</li>
        </ul>
      </div>
    </section>
  );
}

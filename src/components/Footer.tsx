// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import { useCatalog } from './CatalogProvider';
import { TAXONOMY } from '@/data/taxonomy';
import { FOUNDED, SHOP_ADDRESS, SHOP_NAME } from '@/data/site';

export default function Footer() {
  const { settings } = useCatalog();
  const name = settings?.shopName || SHOP_NAME;
  const address = settings?.shopAddress || SHOP_ADDRESS;
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand">
          <div className="logo">
            <span className="logo-mark">梅</span>
            <div>
              <div className="logo-name">{name}</div>
              <div className="logo-sub">TỪ NĂM {FOUNDED}</div>
            </div>
          </div>
          <p className="footer-tag">Tạp hóa tại Long Phú, Cần Thơ. Thiết kế giỏ quà Tết, hoa tươi, hoa sáp, hoa lụa và bánh kẹo decor theo yêu cầu.</p>
          {(settings?.facebookUrl || settings?.tiktokUrl) && (
            <div className="footer-social">
              {settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener">Facebook</a>}
              {settings.tiktokUrl && <a href={settings.tiktokUrl} target="_blank" rel="noopener">TikTok</a>}
            </div>
          )}
        </div>

        <div className="footer-col">
          <h4>Danh mục</h4>
          <ul>
            {TAXONOMY.map((c) => (<li key={c.slug}><a href={`/danh-muc/${c.slug}/`}>{c.name}</a></li>))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Thông tin</h4>
          <ul>
            <li><a href="/ve-chung-toi/">Về tiệm</a></li>
            <li><Link href="/chinh-sach/">Chính sách đặt hàng và đặt cọc</Link></li>
            <li><Link href="/dat-hang/">Giỏ hàng, đặt hàng</Link></li>
            <li><Link href="/cai-app/">Cài app về điện thoại</Link></li>
          </ul>
        </div>

        <div className="footer-col footer-contact">
          <h4>Liên hệ</h4>
          <ul>
            <li>📍 {address}</li>
            {settings?.shopPhone && <li><a href={`tel:${settings.shopPhone}`}>☎ {settings.shopPhone}</a></li>}
            {settings?.zalo && <li><a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noopener">💬 Zalo: {settings.zalo}</a></li>}
            {settings?.hours && <li>🕘 {settings.hours}</li>}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {new Date().getFullYear()} {name}</span>
        </div>
      </div>
    </footer>
  );
}

// src/components/BottomNav.tsx — Thanh điều hướng dưới cho điện thoại
'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useCatalog } from './CatalogProvider';

const Ico = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export default function BottomNav({ onOpenSearch }: { onOpenSearch: () => void }) {
  const totalCount = useCartStore((s) => s.totalCount());
  const openCart = useCartStore((s) => s.openCart);
  const { settings } = useCatalog();
  return (
    <nav className="bottom-nav visible" aria-label="Điều hướng nhanh">
      <Link href="/" className="bn-item"><Ico d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM9 22V12h6v10" /><span>Trang chủ</span></Link>
      <button className="bn-item" onClick={onOpenSearch}><Ico d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.3-4.3" /><span>Tìm</span></button>
      {settings?.shopPhone ? (
        <a href={`tel:${settings.shopPhone}`} className="bn-item"><Ico d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /><span>Gọi tiệm</span></a>
      ) : (
        <a href="/danh-muc/gio-qua-tet/" className="bn-item"><Ico d="M4 9h16v4H4zM6 13h12v7H6zM12 9v11" /><span>Giỏ quà</span></a>
      )}
      <button className="bn-item" onClick={openCart}>
        <div className="bn-cart-wrap"><Ico d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0" />{totalCount > 0 && <span className="bn-cart-count">{totalCount}</span>}</div>
        <span>Giỏ</span>
      </button>
      <Link href="/dat-hang/" className="bn-item bn-cta"><Ico d="M5 12h14m-7-7 7 7-7 7" /><span>Đặt hàng</span></Link>
    </nav>
  );
}

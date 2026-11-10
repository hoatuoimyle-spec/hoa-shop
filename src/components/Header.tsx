// src/components/Header.tsx — Thanh trên cùng + menu
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import { useCatalog } from './CatalogProvider';
import { TAXONOMY } from '@/data/taxonomy';
import { FOUNDED, SHOP_NAME } from '@/data/site';
import InstallButton from './InstallButton';

export default function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalCount = useCartStore((s) => s.totalCount());
  const openCart = useCartStore((s) => s.openCart);
  const { settings } = useCatalog();
  const name = settings?.shopName || SHOP_NAME;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-msg">{settings?.notice || `${name} · Mở cửa từ năm ${FOUNDED} · Long Phú, Cần Thơ`}</span>
          <div className="topbar-contact">
            {settings?.shopPhone && <a href={`tel:${settings.shopPhone}`}>☎ {settings.shopPhone}</a>}
            {settings?.shopPhone && settings?.hours && <span className="dot">•</span>}
            {settings?.hours && <span>{settings.hours}</span>}
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <button className="menu-toggle" aria-label="Menu" onClick={() => setMobileOpen((v) => !v)}>
            <span></span><span></span><span></span>
          </button>

          <Link href="/" className="logo">
            <span className="logo-mark">梅</span>
            <span className="logo-text">
              <span className="logo-name">{name}</span>
              <span className="logo-sub">QUÀ TẾT · HOA · BÁNH KẸO</span>
            </span>
          </Link>

          <nav className={`main-nav ${mobileOpen ? 'open' : ''}`} aria-label="Menu chính">
            {TAXONOMY.map((c) => (
              <a key={c.slug} href={`/danh-muc/${c.slug}/`}>{c.short}</a>
            ))}
            <a href="/ve-chung-toi/">Về tiệm</a>
          </nav>

          <div className="header-actions">
            <InstallButton className="icon-btn install-btn" label="Cài app" />
            <button className="icon-btn" aria-label="Tìm kiếm" onClick={onOpenSearch}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
            <button className="icon-btn cart-btn" aria-label={`Giỏ hàng, ${totalCount} sản phẩm`} onClick={openCart}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              {totalCount > 0 && <span className="cart-count">{totalCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

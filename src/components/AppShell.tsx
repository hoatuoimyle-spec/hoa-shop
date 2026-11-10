// src/components/AppShell.tsx — Khung chung toàn trang
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import CatalogProvider from './CatalogProvider';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return (
    <CatalogProvider>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BottomNav onOpenSearch={() => setSearchOpen(true)} />
    </CatalogProvider>
  );
}

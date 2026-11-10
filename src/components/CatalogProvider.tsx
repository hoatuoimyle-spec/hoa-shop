// src/components/CatalogProvider.tsx — Tải sản phẩm + cài đặt từ /api/products (sửa trong admin là thấy ngay)
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product, Settings, ShopData } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import { unitOf } from '@/lib/utils';

type Line = { index: number; p: Product; options: Record<string, string>; qty: number; unit: number; line: number };

type Ctx = {
  data: ShopData | null;
  error: boolean;
  reload: () => void;
  settings: Settings | null;
  products: Product[];
  lines: Line[]; // chỉ gồm sản phẩm còn bán
  missing: number; // số dòng trong giỏ không còn bán
  cartTotal: number;
};

const C = createContext<Ctx | null>(null);
export const useCatalog = () => {
  const c = useContext(C);
  if (!c) throw new Error('CatalogProvider missing');
  return c;
};

export default function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ShopData | null>(null);
  const [error, setError] = useState(false);
  const items = useCartStore((s) => s.items);

  const reload = useCallback(() => {
    setError(false);
    fetch('/api/products')
      .then((r) => (r.ok ? (r.json() as Promise<ShopData>) : Promise.reject(new Error("bad"))))
      .then((d: ShopData) => setData(d))
      .catch(() => setError(true));
  }, []);
  useEffect(reload, [reload]);

  const value = useMemo<Ctx>(() => {
    const products = data?.products ?? [];
    const lines: Line[] = [];
    let missing = 0;
    items.forEach((it, index) => {
      const p = products.find((x) => x.id === it.id);
      if (!p || !p.inStock) { if (data) missing++; return; }
      const unit = unitOf(p, it.options);
      lines.push({ index, p, options: it.options, qty: it.qty, unit, line: unit * it.qty });
    });
    return { data, error, reload, settings: data?.settings ?? null, products, lines, missing, cartTotal: lines.reduce((s, l) => s + l.line, 0) };
  }, [data, error, reload, items]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

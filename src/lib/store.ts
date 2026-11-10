// src/lib/store.ts — Giỏ hàng. Chỉ lưu id + tuỳ chọn + số lượng; GIÁ luôn lấy từ danh mục hiện tại.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = { id: string; options: Record<string, string>; qty: number };

const sameOpts = (a: Record<string, string>, b: Record<string, string>) => JSON.stringify(a) === JSON.stringify(b);

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (it: CartItem) => void;
  setQty: (index: number, qty: number) => void;
  removeAt: (index: number) => void;
  clearCart: () => void;
  totalCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (it) =>
        set((s) => {
          const i = s.items.findIndex((x) => x.id === it.id && sameOpts(x.options, it.options));
          if (i >= 0) return { items: s.items.map((x, k) => (k === i ? { ...x, qty: Math.min(50, x.qty + it.qty) } : x)), isOpen: true };
          return { items: [...s.items, it], isOpen: true };
        }),
      setQty: (index, qty) =>
        set((s) => ({ items: s.items.map((x, k) => (k === index ? { ...x, qty: Math.max(1, Math.min(50, qty)) } : x)) })),
      removeAt: (index) => set((s) => ({ items: s.items.filter((_, k) => k !== index) })),
      clearCart: () => set({ items: [] }),
      totalCount: () => get().items.reduce((n, x) => n + x.qty, 0),
    }),
    {
      name: 'myle-cart-v5',
      partialize: (s) => ({ items: s.items }),
      // Đọc giỏ từ localStorage sau khi trang hiển thị xong (tránh lỗi hydration)
      skipHydration: true,
    }
  )
);

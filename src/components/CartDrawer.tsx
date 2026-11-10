// src/components/CartDrawer.tsx — Giỏ hàng trượt bên cạnh
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { useCatalog } from './CatalogProvider';
import { formatVND } from '@/lib/utils';
import ProductImage from './ProductImage';

export default function CartDrawer() {
  const { isOpen, closeCart, setQty, removeAt, clearCart } = useCartStore();
  const { lines, cartTotal, missing } = useCatalog();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart} aria-hidden={!isOpen} />
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen} aria-label="Giỏ hàng">
        <header className="cart-header">
          <h2>Giỏ hàng ({lines.reduce((n, l) => n + l.qty, 0)})</h2>
          <button className="cart-close" onClick={closeCart} aria-label="Đóng">×</button>
        </header>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛍</div>
            <p>Giỏ hàng đang trống</p>
            <button className="btn btn-ghost" onClick={closeCart}>Tiếp tục xem sản phẩm</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {lines.map((l) => (
                <div className="cart-item" key={l.p.id + JSON.stringify(l.options)}>
                  <div className="cart-item-thumb"><ProductImage src={l.p.images[0]} alt={l.p.name} /></div>
                  <div className="cart-item-info">
                    <h4><a href={`/san-pham/${l.p.id}/`}>{l.p.name}</a></h4>
                    {Object.values(l.options).length > 0 && <p className="cart-item-variant">{Object.values(l.options).join(' · ')}</p>}
                    <p className="cart-item-price">{formatVND(l.unit)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty">
                      <button onClick={() => setQty(l.index, l.qty - 1)} aria-label="Giảm">−</button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.index, l.qty + 1)} aria-label="Tăng">+</button>
                    </div>
                    <button className="cart-remove" onClick={() => removeAt(l.index)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
            <footer className="cart-footer">
              {missing > 0 && <div className="freeship-hint">Có {missing} sản phẩm trong giỏ không còn bán, đã được bỏ qua.</div>}
              <div className="cart-total"><span>Tạm tính</span><strong>{formatVND(cartTotal)}</strong></div>
              <p className="cart-note">Phí giao hàng được báo khi cửa hàng gọi xác nhận.</p>
              <Link href="/dat-hang/" className="btn btn-primary btn-block" onClick={closeCart}>Tiến hành đặt hàng</Link>
              <button className="btn btn-ghost btn-block" onClick={clearCart}>Xóa giỏ hàng</button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

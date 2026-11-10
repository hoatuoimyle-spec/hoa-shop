// src/components/ProductCard.tsx — Thẻ sản phẩm (liên kết tới trang riêng /san-pham/<id>/)
'use client';

import { useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { defaultOptions, formatVND, hasPriceRange, minUnit } from '@/lib/utils';
import ProductImage from './ProductImage';

export default function ProductCard({ product: p }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const href = `/san-pham/${p.id}/`;
  const hasOptions = p.options.length > 0;
  const sale = p.salePrice !== null && p.salePrice < p.price;

  return (
    <article className="product-card">
      <a href={href} className="product-image-link" aria-label={p.name}>
        <div className="product-image-wrap">
          <ProductImage src={p.images[0]} alt={p.name} />
          {sale && <span className="badge badge-new">Giảm giá</span>}
          {!p.inStock && <span className="badge badge-bestseller">Hết hàng</span>}
        </div>
      </a>
      <div className="product-info">
        <h3 className="product-name"><a href={href}>{p.name}</a></h3>
        {p.description && <p className="product-desc">{p.description}</p>}
        <div className="product-bottom">
          <div className="product-price">
            {hasPriceRange(p) && <span className="price-from">từ </span>}
            <span className="price-current">{formatVND(minUnit(p))}</span>
            {sale && !hasPriceRange(p) && <s className="price-old">{formatVND(p.price)}</s>}
          </div>
          <div className="product-actions">
            {hasOptions || !p.inStock ? (
              <a className="btn btn-ghost btn-sm" href={href}>{p.inStock ? 'Chọn mẫu' : 'Xem'}</a>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => addItem({ id: p.id, options: defaultOptions(p), qty: 1 })}>
                Thêm vào giỏ
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

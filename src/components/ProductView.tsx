// src/components/ProductView.tsx — Trang chi tiết sản phẩm (đường dẫn /san-pham/<id>/)
'use client';

import { useEffect, useMemo, useState } from 'react';
import { findCategory } from '@/data/taxonomy';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { defaultOptions, formatVND, unitOf } from '@/lib/utils';
import { useCatalog } from './CatalogProvider';
import ProductCard from './ProductCard';
import ProductImage from './ProductImage';

export default function ProductView() {
  const [slug, setSlug] = useState<string | null>(null);
  const [seed, setSeed] = useState<Product | null>(null);
  const { products, data, error } = useCatalog();

  useEffect(() => {
    const s = decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || '');
    setSlug(s);
    const seeded = (window as any).__SEED__?.product;
    if (seeded && seeded.id === s) setSeed(seeded as Product);
  }, []);

  const product = useMemo(() => products.find((p) => p.id === slug) || (!data ? seed : null), [products, slug, data, seed]);

  if (slug === null) return <div className="container page-pad muted">Đang tải…</div>;
  if (!product) {
    if (!data && !error) return <div className="container page-pad muted">Đang tải…</div>;
    return <div className="container page-pad"><h1>Không tìm thấy sản phẩm</h1><p>Sản phẩm có thể đã ngừng bán. <a href="/">Về trang chủ</a></p></div>;
  }
  return <Detail key={product.id} p={product} related={products.filter((x) => x.category === product.category && x.id !== product.id).slice(0, 4)} />;
}

function Detail({ p, related }: { p: Product; related: Product[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const [opts, setOpts] = useState<Record<string, string>>(() => defaultOptions(p));
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const unit = unitOf(p, opts);
  const found = findCategory(p.subcategory || p.category);
  const sale = p.salePrice !== null && p.salePrice < p.price;

  const add = (go?: boolean) => {
    addItem({ id: p.id, options: opts, qty });
    if (go) window.location.href = '/dat-hang/';
  };

  return (
    <div className="container page-pad">
      <nav className="breadcrumb" aria-label="Đường dẫn">
        <a href="/">Trang chủ</a><span>/</span>
        {found && <><a href={`/danh-muc/${found.top.slug}/`}>{found.top.name}</a><span>/</span></>}
        {found?.sub && <><a href={`/danh-muc/${found.sub.slug}/`}>{found.sub.name}</a><span>/</span></>}
        <b>{p.name}</b>
      </nav>

      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-main"><ProductImage src={p.images[img]} alt={p.name} eager /></div>
          {p.images.length > 1 && (
            <div className="pdp-thumbs">
              {p.images.map((u, i) => (
                <button key={u} className={`pdp-thumb ${i === img ? 'active' : ''}`} onClick={() => setImg(i)} aria-label={`Ảnh ${i + 1}`}><ProductImage src={u} alt="" /></button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <h1>{p.name}</h1>
          <div className="pdp-price">
            <strong>{formatVND(unit)}</strong>
            {sale && p.options.length === 0 && <s>{formatVND(p.price)}</s>}
          </div>
          {p.description && <p className="pdp-desc">{p.description}</p>}

          {p.options.map((o) => (
            <fieldset key={o.name} className="pdp-opt">
              <legend>{o.name}</legend>
              <div className="qv-options">
                {o.choices.map((c) => (
                  <button type="button" key={c.label} className={`qv-option ${opts[o.name] === c.label ? 'active' : ''}`} aria-pressed={opts[o.name] === c.label} onClick={() => setOpts((s) => ({ ...s, [o.name]: c.label }))}>
                    {c.label}
                    {c.delta !== 0 && <span className="qv-option-delta">{c.delta > 0 ? '+' : '−'}{formatVND(Math.abs(c.delta))}</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          {(p.dimensions || p.materials || p.leadDays > 0) && (
            <dl className="pdp-specs">
              {p.dimensions && <><dt>Kích thước</dt><dd>{p.dimensions}</dd></>}
              {p.materials && <><dt>Chất liệu</dt><dd>{p.materials}</dd></>}
              {p.leadDays > 0 && <><dt>Đặt trước</dt><dd>{p.leadDays} ngày</dd></>}
            </dl>
          )}

          {p.inStock ? (
            <div className="pdp-buy">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Giảm">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="Tăng">+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => add()}>Thêm vào giỏ · {formatVND(unit * qty)}</button>
              <button className="btn btn-ghost btn-lg" onClick={() => add(true)}>Đặt ngay</button>
            </div>
          ) : (
            <p className="empty-state">Sản phẩm tạm hết hàng. Vui lòng liên hệ cửa hàng.</p>
          )}
          <p className="pdp-note">Giá chưa gồm phí giao hàng. Cửa hàng gọi xác nhận mẫu, ngày giờ và địa chỉ trước khi làm.</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-tight">
          <h2 className="page-subtitle">Sản phẩm cùng danh mục</h2>
          <div className="products-grid">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </section>
      )}
    </div>
  );
}

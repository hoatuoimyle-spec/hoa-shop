// src/components/CategoryView.tsx — Danh sách sản phẩm theo danh mục (đường dẫn /danh-muc/<slug>/)
'use client';

import { useEffect, useState } from 'react';
import { findCategory } from '@/data/taxonomy';
import { useCatalog } from './CatalogProvider';
import ProductCard from './ProductCard';

export default function CategoryView() {
  const [slug, setSlug] = useState<string | null>(null);
  const { products, data, error } = useCatalog();

  useEffect(() => {
    setSlug(decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || ''));
  }, []);

  if (slug === null) return <div className="container page-pad muted">Đang tải…</div>;
  const found = findCategory(slug);
  if (!found) return <div className="container page-pad"><h1>Không tìm thấy danh mục</h1><p><a href="/">Về trang chủ</a></p></div>;

  const { top, sub } = found;
  const cur = sub || top;
  const list = products.filter((p) => p.category === top.slug && (!sub || p.subcategory === sub.slug));

  return (
    <div className="container page-pad">
      <nav className="breadcrumb" aria-label="Đường dẫn">
        <a href="/">Trang chủ</a><span>/</span>
        {sub ? <><a href={`/danh-muc/${top.slug}/`}>{top.name}</a><span>/</span><b>{sub.name}</b></> : <b>{top.name}</b>}
      </nav>
      <h1 className="page-title">{cur.name}</h1>
      <p className="page-lead">{sub ? `${sub.name} thuộc nhóm ${top.name} tại Tạp Hóa Mỹ Lệ.` : top.desc}</p>

      {top.children.length > 0 && (
        <div className="chips" role="list">
          <a role="listitem" className={`chip ${!sub ? 'active' : ''}`} href={`/danh-muc/${top.slug}/`}>Tất cả</a>
          {top.children.map((c) => (
            <a role="listitem" key={c.slug} className={`chip ${sub?.slug === c.slug ? 'active' : ''}`} href={`/danh-muc/${c.slug}/`}>{c.name}</a>
          ))}
        </div>
      )}

      {error && <p className="empty-state">Không tải được danh sách sản phẩm. Vui lòng tải lại trang.</p>}
      {!data && !error && <p className="muted">Đang tải sản phẩm…</p>}
      {data && list.length === 0 && <p className="empty-state">Chưa có sản phẩm trong mục này. Vui lòng liên hệ cửa hàng để được tư vấn mẫu theo yêu cầu.</p>}
      {list.length > 0 && <div className="products-grid">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  );
}

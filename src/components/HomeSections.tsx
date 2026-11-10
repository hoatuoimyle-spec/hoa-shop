// src/components/HomeSections.tsx — Danh mục, sản phẩm theo nhóm, giới thiệu ngắn
'use client';

import { TAXONOMY } from '@/data/taxonomy';
import { useCatalog } from './CatalogProvider';
import ProductCard from './ProductCard';
import { FOUNDED, SHOP_ADDRESS } from '@/data/site';

const EMOJI: Record<string, string> = { 'gio-qua-tet': '🎁', 'banh-keo': '🍪', 'hoa-tuoi': '🌸', 'hoa-sap-hoa-lua': '🏵️', 'qua-tang-khac': '✨' };

export default function HomeSections() {
  const { products, data, error, settings } = useCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <>
      <section className="section categories-section" id="danh-muc">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Danh mục</span>
            <h2 className="section-title">Bạn đang tìm gì?</h2>
          </div>
          <div className="categories-grid">
            {TAXONOMY.map((c) => (
              <a key={c.slug} href={`/danh-muc/${c.slug}/`} className="category-card">
                <div className="category-emoji">{EMOJI[c.slug]}</div>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
                <span className="category-arrow">Xem tất cả →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {error && <section className="section"><div className="container empty-state">Không tải được danh sách sản phẩm. Vui lòng tải lại trang.</div></section>}
      {data && products.length === 0 && (
        <section className="section"><div className="container empty-state">Cửa hàng đang cập nhật sản phẩm. Vui lòng liên hệ trực tiếp{settings?.shopPhone ? ` qua số ${settings.shopPhone}` : ''} để được tư vấn.</div></section>
      )}

      {featured.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-head"><span className="section-eyebrow">Nổi bật</span><h2 className="section-title">Được chọn nhiều</h2></div>
            <div className="products-grid">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        </section>
      )}

      {TAXONOMY.map((c) => {
        const items = products.filter((p) => p.category === c.slug).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={c.slug} className="section featured-section" id={c.slug}>
            <div className="container">
              <div className="section-head">
                <span className="section-eyebrow">{c.name}</span>
                <h2 className="section-title">{c.desc}</h2>
              </div>
              <div className="products-grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
              <div className="section-more"><a className="btn btn-ghost" href={`/danh-muc/${c.slug}/`}>Xem tất cả {c.name.toLowerCase()}</a></div>
            </div>
          </section>
        );
      })}

      <section className="section about-strip">
        <div className="container about-strip-inner">
          <div>
            <span className="section-eyebrow">Về tiệm</span>
            <h2 className="section-title">Tạp hóa gia đình, mở cửa từ năm {FOUNDED}</h2>
          </div>
          <div>
            <p>Tạp Hóa Mỹ Lệ ở Ấp 3, xã Long Phú, TP. Cần Thơ, bán sỉ và lẻ nhu yếu phẩm, gạo sạch, thức ăn chăn nuôi, bia nước ngọt. Ngoài hàng tiêu dùng, tiệm còn thiết kế giỏ quà Tết, hoa tươi, hoa sáp, hoa lụa và bánh kẹo decor theo yêu cầu.</p>
            <p><a className="btn btn-primary" href="/ve-chung-toi/">Xem thêm về tiệm</a></p>
            <p className="muted">{settings?.shopAddress || SHOP_ADDRESS}</p>
          </div>
        </div>
      </section>
    </>
  );
}

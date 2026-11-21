'use client';

import { useCatalog } from './CatalogProvider';
import ProductCard from './ProductCard';

export default function ChristmasCollection() {
  const { products, data, error, settings } = useCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  if (error) {
    return (
      <section className="xmas-section">
        <div className="container empty-state">
          Không tải được danh sách sản phẩm. Vui lòng tải lại trang.
        </div>
      </section>
    );
  }

  if (!data || products.length === 0) {
    return (
      <section className="xmas-section">
        <div className="container empty-state">
          Cửa hàng đang cập nhật sản phẩm. Vui lòng liên hệ trực tiếp{settings?.shopPhone ? ` qua số ${settings.shopPhone}` : ''} để được tư vấn.
        </div>
      </section>
    );
  }

  return (
    <section className="xmas-section xmas-collection">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Bộ sưu tập Giáng Sinh</span>
          <h2 className="section-title">Sản phẩm đặc biệt cho mùa lễ hội</h2>
        </div>
        <div className="products-grid">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {products.length > 0 && (
          <div className="section-more">
            <a className="xmas-btn xmas-btn-ghost" href="/danh-muc/gio-qua-tet/">
              Xem tất cả sản phẩm Giáng Sinh
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

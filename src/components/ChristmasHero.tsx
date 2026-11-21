'use client';

import Link from 'next/link';
import { useCatalog } from './CatalogProvider';
import { FOUNDED, SHOP_NAME } from '@/data/site';
import Snowfall from './Snowfall';

export default function ChristmasHero() {
  const { settings } = useCatalog();
  const name = settings?.shopName || SHOP_NAME;

  return (
    <section className="xmas-hero">
      <Snowfall />
      <div className="xmas-hero-bg" aria-hidden="true">
        <div className="xmas-tree">
          <div className="tree-tier tree-tier-1"></div>
          <div className="tree-tier tree-tier-2"></div>
          <div className="tree-tier tree-tier-3"></div>
          <div className="tree-trunk"></div>
          <div className="tree-star">★</div>
          <div className="tree-ornament o1"></div>
          <div className="tree-ornament o2"></div>
          <div className="tree-ornament o3"></div>
          <div className="tree-ornament o4"></div>
          <div className="tree-ornament o5"></div>
        </div>
        <div className="xmas-santa">
          <div className="santa-body"></div>
          <div className="santa-head"></div>
          <div className="santa-hat"></div>
          <div className="santa-beard"></div>
        </div>
        <div className="xmas-snowman">
          <div className="snowman-bottom"></div>
          <div className="snowman-middle"></div>
          <div className="snowman-head"></div>
          <div className="snowman-hat"></div>
          <div className="snowman-scarf"></div>
        </div>
        <div className="xmas-gifts">
          <div className="gift g1"></div>
          <div className="gift g2"></div>
          <div className="gift g3"></div>
        </div>
      </div>
      <div className="xmas-hero-content">
        <div className="xmas-badge">MERRY CHRISTMAS</div>
        <h1 className="xmas-title">
          GIÁNG SINH AN LÀNH<br />
          <span className="xmas-title-accent">tại Tạp Hóa Mỹ Lệ</span>
        </h1>
        <p className="xmas-sub">
          Không khí Giáng Sinh đã đến. Khám phá giỏ quà Tết, hoa tươi, hoa sáp, hoa lụa và bánh kẹo decor đặc biệt cho mùa lễ hội này.
        </p>
        <div className="xmas-cta">
          <Link href="/danh-muc/gio-qua-tet/" className="xmas-btn xmas-btn-primary btn-lg">
            Xem giỏ quà Giáng Sinh
          </Link>
          <Link href="/danh-muc/hoa-tuoi/" className="xmas-btn xmas-btn-ghost btn-lg">
            Chọn hoa tươi
          </Link>
        </div>
      </div>
    </section>
  );
}

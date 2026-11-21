'use client';

import Link from 'next/link';
import { TAXONOMY } from '@/data/taxonomy';

const CATEGORY_ICONS: Record<string, string> = {
  'gio-qua-tet': '🎁',
  'banh-keo': '🍪',
  'hoa-tuoi': '🌸',
  'hoa-sap-hoa-lua': '🏵️',
};

// Chỉ hiển thị 4 nhóm chính trên landing page Giáng Sinh (không sửa taxonomy gốc)
const ALLOWED_SLUGS = ['gio-qua-tet', 'hoa-tuoi', 'hoa-sap-hoa-lua', 'banh-keo'];

export default function ChristmasCategories() {
  const filteredCategories = TAXONOMY.filter((c) => ALLOWED_SLUGS.includes(c.slug));

  return (
    <section className="xmas-categories">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Danh mục Giáng Sinh</span>
          <h2 className="section-title">Bạn đang tìm gì?</h2>
        </div>
        <div className="categories-grid">
          {filteredCategories.map((c) => (
            <Link key={c.slug} href={`/danh-muc/${c.slug}/`} className="category-card">
              <div className="category-emoji">{CATEGORY_ICONS[c.slug] || '✨'}</div>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <span className="category-arrow">Xem tất cả →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

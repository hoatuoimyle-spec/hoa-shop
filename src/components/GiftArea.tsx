'use client';

import Link from 'next/link';

export default function GiftArea() {
  return (
    <section className="xmas-gift-area">
      <div className="container">
        <div className="gift-content">
          <div className="gift-illustration">
            <div className="gift-box">
              <div className="gift-lid"></div>
              <div className="gift-box-body"></div>
              <div className="gift-ribbon-vertical"></div>
              <div className="gift-ribbon-horizontal"></div>
              <div className="gift-bow"></div>
            </div>
            <div className="gift-tag">CHO BẠN</div>
          </div>
          <div className="gift-text">
            <span className="section-eyebrow">Quà tặng Giáng Sinh</span>
            <h2 className="section-title">Trao gửi yêu thương</h2>
            <p className="gift-desc">
              Một món quà Giáng Sinh là cách tốt nhất để thể hiện sự quan tâm và tình cảm đến người thân, bạn bè và đối tác.
            </p>
            <Link href="/danh-muc/gio-qua-tet/" className="xmas-btn xmas-btn-primary btn-lg">
              Chọn giỏ quà Giáng Sinh
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

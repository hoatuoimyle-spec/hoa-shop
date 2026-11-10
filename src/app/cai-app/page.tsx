// src/app/cai-app/page.tsx — Hướng dẫn cài web như ứng dụng (PWA), không cần Google Play
'use client';

import InstallButton from '@/components/InstallButton';

export default function InstallPage() {
  return (
    <div className="about-page">
      <div className="container prose">
        <h1 className="page-title">Cài app về điện thoại</h1>
        <p>Không cần vào kho ứng dụng. Cài trực tiếp từ trình duyệt, biểu tượng sẽ nằm ở màn hình chính.</p>
        <p><InstallButton className="btn btn-primary" label="Cài ngay" /></p>
        <h2>Android (Chrome)</h2>
        <p>Bấm nút ⋮ ở góc trên, chọn “Thêm vào màn hình chính” hoặc “Cài đặt ứng dụng”.</p>
        <h2>iPhone (Safari)</h2>
        <p>Bấm nút Chia sẻ (ô vuông có mũi tên lên), kéo xuống chọn “Thêm vào MH chính”.</p>
        <h2>Máy tính (Chrome, Edge)</h2>
        <p>Bấm biểu tượng cài đặt ở cuối thanh địa chỉ.</p>
      </div>
    </div>
  );
}

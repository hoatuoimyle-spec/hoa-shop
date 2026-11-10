// src/app/chinh-sach/page.tsx — Chính sách đặt hàng và đặt cọc (chỉ ghi những gì hệ thống thực sự làm)
import type { Metadata } from 'next';
import { SITE_URL } from '@/data/site';

export const metadata: Metadata = {
  title: 'Chính sách đặt hàng và đặt cọc',
  description: 'Cách đặt hàng, đặt cọc và thanh toán tại Tạp Hóa Mỹ Lệ.',
  alternates: { canonical: `${SITE_URL}/chinh-sach/` },
};

export default function PolicyPage() {
  return (
    <div className="about-page">
      <div className="container prose">
        <h1 className="page-title">Chính sách đặt hàng và đặt cọc</h1>
        <h2>Cách đặt hàng</h2>
        <p>Chọn sản phẩm, điền thông tin nhận hàng, chọn ngày và khung giờ nhận. Đơn được gửi trực tiếp đến cửa hàng. Cửa hàng gọi điện xác nhận mẫu, ngày giờ, địa chỉ và phí giao hàng.</p>
        <h2>Đặt cọc</h2>
        <p>Với đơn thanh toán khi nhận hàng, khách chuyển cọc theo tỷ lệ hiển thị tại trang đặt hàng, phần còn lại trả cho người giao khi nhận hàng. Khách cũng có thể chuyển khoản toàn bộ. Cửa hàng bắt đầu chuẩn bị sau khi nhận được tiền cọc.</p>
        <h2>Giá và phí giao hàng</h2>
        <p>Giá hiển thị là giá sản phẩm, chưa gồm phí giao hàng. Phí giao hàng được báo khi cửa hàng gọi xác nhận.</p>
        <h2>Thay đổi hoặc hủy đơn</h2>
        <p>Vui lòng liên hệ cửa hàng sớm, kèm mã đơn, để được hỗ trợ.</p>
      </div>
    </div>
  );
}

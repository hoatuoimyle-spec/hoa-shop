// src/app/ve-chung-toi/page.tsx — Giới thiệu tiệm (nội dung do chủ tiệm cung cấp)
import type { Metadata } from 'next';
import { FOUNDED, SHOP_ADDRESS, SHOP_NAME, SITE_URL } from '@/data/site';

export const metadata: Metadata = {
  title: `Về ${SHOP_NAME} | Long Phú, Cần Thơ`,
  description: `${SHOP_NAME} mở cửa từ năm ${FOUNDED} tại ${SHOP_ADDRESS}: nhu yếu phẩm, gạo sạch, thức ăn chăn nuôi, đại lý bia nước ngọt, nạo vắt nước cốt dừa, giỏ quà Tết, hoa tươi, hoa sáp, hoa lụa.`,
  alternates: { canonical: `${SITE_URL}/ve-chung-toi/` },
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="container prose">
        <span className="section-eyebrow">Về tiệm</span>
        <h1 className="page-title">{SHOP_NAME}, mở cửa từ năm {FOUNDED}</h1>
        <p>Tạp Hóa Mỹ Lệ tại Ấp 3, xã Long Phú, TP. Cần Thơ là địa chỉ chuyên cung cấp sỉ và lẻ các mặt hàng nhu yếu phẩm, gạo sạch, thức ăn chăn nuôi và đại lý bia nước ngọt các loại với giá bình ổn.</p>

        <h2>Dịch vụ tại tiệm</h2>
        <ul>
          <li>Nạo và vắt nước cốt dừa nguyên chất bằng máy, phục vụ bà con nội trợ và hộ làm bánh.</li>
          <li>Nhận tiền và chuyển khoản hộ.</li>
          <li>Bán thẻ điện thoại Viettel, Mobifone, Vinaphone, Vietnamobile.</li>
          <li>Bán thẻ game: Zing, Garena, Vcoin, Oncash, Sohacoin, Funcard…</li>
        </ul>

        <h2>Quà Tết, hoa và bánh kẹo theo yêu cầu</h2>
        <p>Bên cạnh hàng tiêu dùng hằng ngày, tiệm thiết kế giỏ quà Tết cho doanh nghiệp và cá nhân, gói quà theo ngân sách và yêu cầu riêng. Tiệm cũng làm hoa tươi, hoa sáp, hoa lụa và bánh kẹo decor theo yêu cầu của khách hàng.</p>
        <p><a className="btn btn-primary" href="/danh-muc/gio-qua-tet/">Xem giỏ quà Tết</a> <a className="btn btn-ghost" href="/danh-muc/hoa-tuoi/">Xem hoa tươi</a></p>

        <h2>Địa chỉ</h2>
        <p>{SHOP_ADDRESS}</p>
      </div>
    </div>
  );
}

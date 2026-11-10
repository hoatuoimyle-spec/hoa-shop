# Cập nhật Tạp Hóa Mỹ Lệ lên bản v5

v5 = giao diện v4 (đỏ son, navy, nâu pastel) + backend v3 (đặt cọc, VietQR, Telegram) + danh mục mới + trang riêng cho từng sản phẩm (SEO) + admin sửa sản phẩm.

## Bước 1 — Giải nén và cài
Giải nén zip, mở Terminal trong thư mục, gõ: `npm install`

## Bước 2 — Điền database_id
Mở `wrangler.toml`, thay `database_id` bằng ID của database `hoa-shop` (Cloudflare → Storage & Databases → D1 → hoa-shop). Thay `TELEGRAM_CHAT_ID` bằng chat id nhận đơn của bạn.

## Bước 3 — Nâng cấp database (CHỈ CHẠY 1 LẦN)
`npm run db:migrate`
Lệnh này đổi bảng sản phẩm sang danh mục mới, giữ nguyên đơn hàng cũ. Sản phẩm mẫu cũ được xếp vào danh mục mới.
(Tùy chọn) `npm run db:samples` thêm 19 sản phẩm mẫu đang ẨN, để bạn mở ra sửa lại cho đúng hàng thật.

## Bước 4 — Đưa lên web
`npm run deploy`
Secret TELEGRAM_BOT_TOKEN và ADMIN_TOKEN đã đặt từ trước nên không cần đặt lại.

## Bước 5 — Nhập thông tin thật trong trang quản trị
Vào `https://hoa.qthong0893.io.vn/admin.html`, đăng nhập bằng ADMIN_TOKEN:
1. Tab "Thông tin cửa hàng": số điện thoại, Zalo, giờ mở cửa, ngân hàng + số tài khoản (để có mã QR), % đặt cọc.
2. Tab "Sản phẩm": sửa/ẩn/xóa/thêm sản phẩm, tải ảnh thật (tự nén), chọn danh mục và danh mục con. Mỗi sản phẩm có trang riêng `/san-pham/<đường-dẫn>/`.
3. Sản phẩm mẫu hiện ảnh minh họa; hãy thay bằng ảnh thật rồi bật "Hiển thị trên web".

## Bước 6 — Thử đặt một đơn
Đặt thử trên web, kiểm tra Telegram nhận được tin, quét thử mã QR (số tiền phải đúng tiền cọc).

## Gửi sitemap cho Google
Search Console → Sitemaps → nhập `https://hoa.qthong0893.io.vn/sitemap.xml`.

## Quay lại bản cũ
Cloudflare → Workers & Pages → hoa-shop → Deployments → chọn bản cũ → Rollback.

## Ghi chú
- Đã bỏ mục "cam kết", số liệu và đánh giá không có thật; trang Blog tạm bỏ.
- Đường dẫn sản phẩm không đổi được sau khi tạo (để giữ SEO).
- Webhook Telegram cũ `/api/telegram` giữ nguyên.

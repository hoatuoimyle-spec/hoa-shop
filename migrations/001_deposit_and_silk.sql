-- Nâng cấp v2: đặt cọc + đổi 'hoa họa' thành 'hoa lụa'.
-- CHỈ CHẠY MỘT LẦN trên database đang chạy (chạy lần 2 sẽ báo lỗi 'duplicate column', không gây hại).

ALTER TABLE orders ADD COLUMN deposit_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN deposit_paid INTEGER NOT NULL DEFAULT 0;

INSERT OR IGNORE INTO settings (key,value) VALUES ('deposit_percent','50');
INSERT OR IGNORE INTO settings (key,value) VALUES ('bank_bin','');
INSERT OR IGNORE INTO settings (key,value) VALUES ('bank_account','');
INSERT OR IGNORE INTO settings (key,value) VALUES ('bank_account_name','');

-- Chỉ thay nội dung 2 sản phẩm mẫu nếu bạn CHƯA tự đổi tên của chúng.

UPDATE products SET name='Bình hoa lụa mẫu đơn', description='Bình hoa lụa mẫu đơn cao cấp, cánh mềm và có độ rủ như hoa thật, giữ dáng và màu nhiều năm, không cần chăm sóc. Hợp tặng tân gia, đặt phòng khách, bàn thờ, quán cà phê.', dimensions='Cao khoảng 45 cm hoặc 65 cm', materials='Hoa lụa cao cấp, bình gốm, cành kẽm bọc', options='[{"name": "Kích thước", "choices": [{"label": "Cao 45 cm", "delta": 0}, {"label": "Cao 65 cm", "delta": 380000}]}, {"name": "Tông màu", "choices": [{"label": "Đỏ đô", "delta": 0}, {"label": "Kem nâu", "delta": 0}, {"label": "Xanh navy", "delta": 30000}]}]', lead_days=3, tags='["tan-gia", "trang-tri", "hoa-lua"]' WHERE id='tranh-hoa-hoa-khung-go' AND name='Tranh hoa họa khung gỗ';
UPDATE products SET name='Hoa lụa cắm hộp để bàn', description='Hoa lụa cắm sẵn trong hộp tròn, đặt bàn làm việc, kệ tivi hoặc quầy lễ tân. Không héo, không cần thay nước, lau bụi nhẹ là đẹp lại.', dimensions='Hộp tròn đường kính 20 cm, cao 25 cm', materials='Hoa lụa, hộp giấy cứng, mút cố định', options='[{"name": "Tông màu", "choices": [{"label": "Đỏ đô", "delta": 0}, {"label": "Kem nâu", "delta": 0}, {"label": "Xanh đậm", "delta": 0}]}]', lead_days=2, tags='["qua-tang", "trang-tri", "hoa-lua"]' WHERE id='binh-hoa-hoa-de-ban' AND name='Bình hoa họa để bàn';

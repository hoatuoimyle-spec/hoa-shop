-- Nâng cấp v3 -> v5: danh mục mới (có danh mục con), SEO, ảnh tải lên từ admin.
-- CHẠY MỘT LẦN trên database đang chạy. Đơn hàng cũ được giữ nguyên.
-- Danh mục cũ được chuyển: hoa_tuoi -> hoa-tuoi, hoa_sap/hoa_hoa -> hoa-sap-hoa-lua (con: hoa-sap / hoa-lua), qua_tet -> gio-qua-tet.

CREATE TABLE products_v5 (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, subcategory TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL CHECK (price >= 0), sale_price INTEGER CHECK (sale_price IS NULL OR sale_price >= 0),
  images TEXT NOT NULL DEFAULT '[]', description TEXT NOT NULL DEFAULT '', dimensions TEXT NOT NULL DEFAULT '',
  materials TEXT NOT NULL DEFAULT '', options TEXT NOT NULL DEFAULT '[]', lead_days INTEGER NOT NULL DEFAULT 0,
  in_stock INTEGER NOT NULL DEFAULT 1, active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]', sort INTEGER NOT NULL DEFAULT 100,
  seo_title TEXT NOT NULL DEFAULT '', seo_description TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

INSERT INTO products_v5 (id,name,category,subcategory,price,sale_price,images,description,dimensions,materials,options,lead_days,in_stock,active,featured,tags,sort,created_at,updated_at)
SELECT id, name,
  CASE category WHEN 'hoa_tuoi' THEN 'hoa-tuoi' WHEN 'hoa_sap' THEN 'hoa-sap-hoa-lua' WHEN 'hoa_hoa' THEN 'hoa-sap-hoa-lua' WHEN 'qua_tet' THEN 'gio-qua-tet' ELSE 'qua-tang-khac' END,
  CASE category WHEN 'hoa_tuoi' THEN 'bo-hoa' WHEN 'hoa_sap' THEN 'hoa-sap' WHEN 'hoa_hoa' THEN 'hoa-lua' ELSE '' END,
  price, sale_price, images, description, dimensions, materials, options, lead_days, in_stock, active, featured, tags, sort,
  created_at, created_at
FROM products;

DROP TABLE products;
ALTER TABLE products_v5 RENAME TO products;
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category, subcategory, active, sort);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Thông tin thật của tiệm (số điện thoại, Zalo, ngân hàng: tự điền trong trang Quản trị > Cài đặt)
INSERT OR REPLACE INTO settings (key,value) VALUES ('shop_name','Tạp Hóa Mỹ Lệ');
INSERT OR REPLACE INTO settings (key,value) VALUES ('shop_address','Ấp 3, xã Long Phú, TP. Cần Thơ');
INSERT OR IGNORE INTO settings (key,value) VALUES ('shop_phone','');
INSERT OR IGNORE INTO settings (key,value) VALUES ('zalo','');
INSERT OR IGNORE INTO settings (key,value) VALUES ('opening_hours','');
INSERT OR IGNORE INTO settings (key,value) VALUES ('facebook_url','');
INSERT OR IGNORE INTO settings (key,value) VALUES ('tiktok_url','');

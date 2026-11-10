-- Schema D1 v5 (cài mới). Tiền tệ: số nguyên VND.
-- Nâng cấp từ v3: KHÔNG chạy file này, chạy migrations/002_v5_danh_muc.sql

CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,                -- slug, ví dụ bo-hoa-hong-do (cũng là đường dẫn /san-pham/<id>/)
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,                   -- slug danh mục cấp 1 (xem shared/taxonomy.json)
  subcategory     TEXT NOT NULL DEFAULT '',        -- slug danh mục con, hoặc rỗng
  price           INTEGER NOT NULL CHECK (price >= 0),
  sale_price      INTEGER CHECK (sale_price IS NULL OR sale_price >= 0),
  images          TEXT NOT NULL DEFAULT '[]',      -- JSON: ["/api/media/abc", "/img/x.svg"]
  description     TEXT NOT NULL DEFAULT '',
  dimensions      TEXT NOT NULL DEFAULT '',
  materials       TEXT NOT NULL DEFAULT '',
  options         TEXT NOT NULL DEFAULT '[]',      -- JSON: [{name, choices:[{label, delta}]}]
  lead_days       INTEGER NOT NULL DEFAULT 0,
  in_stock        INTEGER NOT NULL DEFAULT 1,
  active          INTEGER NOT NULL DEFAULT 1,
  featured        INTEGER NOT NULL DEFAULT 0,
  tags            TEXT NOT NULL DEFAULT '[]',
  sort            INTEGER NOT NULL DEFAULT 100,
  seo_title       TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category, subcategory, active, sort);

CREATE TABLE IF NOT EXISTS media (
  id         TEXT PRIMARY KEY,
  mime       TEXT NOT NULL,
  data       TEXT NOT NULL,                        -- base64
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  code           TEXT NOT NULL UNIQUE,
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  address        TEXT NOT NULL,
  delivery_date  TEXT NOT NULL,
  time_slot      TEXT NOT NULL,
  card_message   TEXT NOT NULL DEFAULT '',
  note           TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod','bank')),
  items_json     TEXT NOT NULL,
  subtotal       INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL DEFAULT 0,
  deposit_paid   INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','confirmed','making','delivered','cancelled')),
  tg_message_id  INTEGER,
  tg_sent        INTEGER NOT NULL DEFAULT 0,
  ip_hash        TEXT NOT NULL DEFAULT '',
  created_at     INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_ip ON orders(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivery ON orders(delivery_date, status);
CREATE INDEX IF NOT EXISTS idx_orders_tg ON orders(tg_sent, created_at);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

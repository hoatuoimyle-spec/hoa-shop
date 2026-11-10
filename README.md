# Tạp Hóa Mỹ Lệ — Web bán hoa, quà Tết

> Tạp hóa nhỏ, quà Tết sang — phục vụ bà con Long Phú, Cần Thơ từ 1987

Next.js 14 static export + Cloudflare Pages Functions + D1.

## Cấu trúc

```
.
├── app/                    # Next.js App Router (trang tĩnh)
├── components/             # React components
├── functions/              # Cloudflare Pages Functions (API + SSR SEO)
├── lib/                    # Types, utils
├── public/                 # Ảnh, manifest, sw.js, admin.html
├── shared/taxonomy.json    # Danh mục (dùng chung FE + BE)
├── migrations/             # SQL migrations cho D1
├── scripts/                # Prebuild script
└── .github/workflows/      # GitHub Actions (build + deploy)
```

## Phát triển local

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy

Deploy tự động qua GitHub Actions khi gộp PR vào main.
KHÔNG dùng `wrangler pages deploy` trực tiếp (sẽ gây lệch bản).

## Quản trị

- **Admin**: `https://hoa.qthong0893.io.vn/admin.html` (cần ADMIN_TOKEN)
- **Cloudflare**: dashboard → Workers & Pages → hoa-shop
- **D1 database**: dashboard → D1 → hoa-shop

## Bảo mật

- `ADMIN_TOKEN`, `TELEGRAM_BOT_TOKEN`: đặt trong Cloudflare secrets
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`: đặt trong GitHub secrets
- KHÔNG đưa bất kỳ token nào vào code hoặc commit

## Quy trình sửa web qua GitHub (cho Hermes)

1. Tạo nhánh `hermes/<việc>`
2. Sửa file → commit → push
3. Mở Pull Request
4. Khách duyệt + xem preview → Merge
5. GitHub Actions tự deploy

Xem chi tiết: `HERMES-GUIDE.md` và `HUONG-DAN-GITHUB.md`

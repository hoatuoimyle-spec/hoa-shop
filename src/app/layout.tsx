// src/app/layout.tsx — Khung gốc + SEO cơ bản
import './globals.css';
import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import { FOUNDED, SHOP_ADDRESS, SHOP_NAME, SITE_URL } from '@/data/site';

const TITLE = `${SHOP_NAME} | Giỏ quà Tết, hoa tươi, hoa sáp, hoa lụa tại Long Phú, Cần Thơ`;
const DESC = 'Thiết kế giỏ quà Tết, hoa tươi, hoa sáp, hoa lụa và bánh kẹo decor theo yêu cầu. Tạp hóa mở cửa từ năm 1987 tại Ấp 3, xã Long Phú, TP. Cần Thơ.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${SHOP_NAME}` },
  description: DESC,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'vi_VN', siteName: SHOP_NAME, title: TITLE, description: DESC, url: '/' },
  twitter: { card: 'summary', title: TITLE, description: DESC },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
};

export const viewport = { themeColor: '#1B2A4E', width: 'device-width', initialScale: 1 };

const storeLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: SHOP_NAME,
  url: SITE_URL + '/',
  foundingDate: String(FOUNDED),
  address: { '@type': 'PostalAddress', streetAddress: 'Ấp 3, xã Long Phú', addressRegion: 'TP. Cần Thơ', addressCountry: 'VN' },
  description: DESC,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeLd) }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

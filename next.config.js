/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  // Static export cho Cloudflare Pages — không cần server runtime
  // API functions đặt trong /functions/api/* sẽ chạy bằng Cloudflare Pages Functions
};

module.exports = nextConfig;

import ProductView from '@/components/ProductView';

// Trang "vỏ": máy chủ (functions/san-pham/[slug].js) chèn tiêu đề, mô tả, JSON-LD cho từng sản phẩm.
export const metadata = { title: 'Sản phẩm', robots: { index: false } };

export default function Page() {
  return <ProductView />;
}

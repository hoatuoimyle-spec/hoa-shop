import CategoryView from '@/components/CategoryView';

// Trang "vỏ": máy chủ (functions/danh-muc/[slug].js) chèn tiêu đề, mô tả, JSON-LD cho từng danh mục.
export const metadata = { title: 'Danh mục sản phẩm', robots: { index: false } };

export default function Page() {
  return <CategoryView />;
}

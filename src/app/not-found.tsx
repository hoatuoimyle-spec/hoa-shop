export const metadata = { title: 'Không tìm thấy trang', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container page-pad" style={{ textAlign: 'center' }}>
      <h1 className="page-title">Không tìm thấy trang</h1>
      <p className="page-lead">Đường dẫn này không tồn tại hoặc sản phẩm đã ngừng bán.</p>
      <a href="/" className="btn btn-primary">Về trang chủ</a>
    </div>
  );
}

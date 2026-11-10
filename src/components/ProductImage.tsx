'use client';

import { useState } from 'react';

// Ảnh minh họa (.svg) hiển thị trọn khung; ảnh chụp thật hiển thị tràn khung.
export default function ProductImage({ src, alt, eager }: { src?: string; alt: string; eager?: boolean }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return <div className="product-image-fallback">{alt.charAt(0)}</div>;
  const art = /\.svg(\?.*)?$/i.test(src);
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setBad(true)}
      style={{ width: '100%', height: '100%', objectFit: art ? 'contain' : 'cover', padding: art ? 12 : 0 }}
    />
  );
}

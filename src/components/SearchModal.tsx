// src/components/SearchModal.tsx — Tìm kiếm không dấu
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCatalog } from './CatalogProvider';
import { TAXONOMY } from '@/data/taxonomy';
import { formatVND, minUnit, normalizeVietnamese } from '@/lib/utils';

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const { products } = useCatalog();

  useEffect(() => {
    if (!open) { setQ(''); return; }
    const t = setTimeout(() => ref.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  const results = useMemo(() => {
    const n = normalizeVietnamese(q.trim());
    if (!n) return [];
    return products.filter((p) => normalizeVietnamese([p.name, p.description, p.tags.join(' ')].join(' ')).includes(n)).slice(0, 8);
  }, [q, products]);

  if (!open) return null;
  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Tìm sản phẩm" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input ref={ref} type="text" placeholder="Tìm giỏ quà, hoa, bánh kẹo… (gõ không dấu cũng được)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Từ khóa" />
          <button onClick={onClose} aria-label="Đóng">×</button>
        </div>
        {q.trim() ? (
          <div className="search-results">
            {results.length === 0 ? (
              <p className="search-empty">Không thấy sản phẩm phù hợp. Hãy liên hệ cửa hàng để được tư vấn mẫu riêng.</p>
            ) : (
              results.map((p) => (
                <a key={p.id} href={`/san-pham/${p.id}/`} className="search-result">
                  <div className="search-result-name">{p.name}</div>
                  <div className="search-result-meta">từ <strong>{formatVND(minUnit(p))}</strong></div>
                </a>
              ))
            )}
          </div>
        ) : (
          <div className="search-hints">
            <p>Xem theo danh mục:</p>
            <div className="search-tags">
              {TAXONOMY.map((c) => (<a key={c.slug} href={`/danh-muc/${c.slug}/`}>{c.name}</a>))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

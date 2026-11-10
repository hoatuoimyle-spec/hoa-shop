// Nút "Cài app": dùng hộp thoại cài đặt của trình duyệt nếu có, nếu không thì mở trang hướng dẫn.
'use client';

import { useEffect, useState } from 'react';

export default function InstallButton({ className, label }: { className?: string; label: string }) {
  const [evt, setEvt] = useState<any>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true);
    const h = (e: Event) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  if (standalone) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (evt) { evt.prompt(); try { await evt.userChoice; } catch { /* bỏ qua */ } setEvt(null); }
        else window.location.href = '/cai-app/';
      }}
    >
      {label}
    </button>
  );
}

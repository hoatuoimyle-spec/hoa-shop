'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

// Captcha miễn phí của Cloudflare. Chỉ hiện khi bạn đặt TURNSTILE_SITEKEY.
export default function Turnstile({ siteKey, onToken, resetKey }: { siteKey: string; onToken: (t: string) => void; resetKey: number }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!siteKey) return;
    const render = () => {
      if (box.current && window.turnstile && widget.current === undefined) {
        widget.current = window.turnstile.render(box.current, { sitekey: siteKey, callback: onToken });
      }
    };
    if (window.turnstile) { render(); return; }
    let sc = document.getElementById('tsjs') as HTMLScriptElement | null;
    if (!sc) {
      sc = document.createElement('script');
      sc.id = 'tsjs';
      sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      document.head.appendChild(sc);
    }
    sc.addEventListener('load', render);
    return () => sc?.removeEventListener('load', render);
  }, [siteKey, onToken]);

  useEffect(() => {
    if (resetKey > 0 && widget.current !== undefined) { try { window.turnstile?.reset(widget.current); } catch { /* bỏ qua */ } }
  }, [resetKey]);

  if (!siteKey) return null;
  return <div ref={box} style={{ marginTop: 16 }} />;
}

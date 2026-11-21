'use client';

import { useEffect, useState } from 'react';

/**
 * Snowfall — Hiệu ứng rơi tuyết Giáng Sinh.
 * Chính xác 50 hạt tuyết, CSS animation, pointer-events: none.
 * Hỗ trợ prefers-reduced-motion: reduce để tắt animation.
 * Xử lý hydration mismatch: khởi tạo reducedMotion = false, sau khi mount mới cập nhật.
 */
export default function Snowfall() {
  const [flakes, setFlakes] = useState<Array<{ id: number; left: number; size: number; opacity: number; duration: number; delay: number; drift: number }>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const flakesList: Array<{ id: number; left: number; size: number; opacity: number; duration: number; delay: number; drift: number }> = [];
    for (let i = 0; i < 50; i++) {
      flakesList.push({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.5,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 10,
        drift: 10 + Math.random() * 20,
      });
    }
    setFlakes(flakesList);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  return (
    <div
      className="snowfall-container"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'visible' }}
      aria-hidden="true"
    >
      {flakes.map((f) => (
        <div
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            opacity: f.opacity,
            animation: reducedMotion
              ? 'none'
              : `snowfall-fall ${f.duration}s linear ${f.delay}s infinite`,
            boxShadow: reducedMotion ? 'none' : `0 0 ${f.size * 2}px #ffffff`,
          }}
        />
      ))}
    </div>
  );
}

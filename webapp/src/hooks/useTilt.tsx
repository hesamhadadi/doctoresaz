'use client';
import { useRef } from 'react';

/*
  تیلت سه‌بعدی: کارت با حرکت ماوس کمی به سمت نشانگر خم می‌شود (پرسپکتیو).
  خروجی را روی یک عنصر بگذارید: <div {...tilt} >…
  در دستگاه لمسی و با prefers-reduced-motion غیرفعال است.
*/
export default function useTilt({ max = 8, scale = 1.02 } = {}) {
  const ref = useRef<any>(null);

  const enabled = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${px * max}deg) rotateX(${-py * max}deg) scale(${scale})`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  return {
    ref,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    style: { transformStyle: 'preserve-3d', transition: 'transform .25s cubic-bezier(.22,1,.36,1)' } as React.CSSProperties,
  };
}

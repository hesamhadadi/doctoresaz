'use client';
import { useEffect, useRef, useState } from 'react';

/*
  اسکرول-ریویل: هر بخش هنگام ورود به دید، نرم ظاهر و بالا می‌آید.
  با IntersectionObserver — سبک و بدون کتابخانه.
  از prefers-reduced-motion پیروی می‌کند (فوراً و بدون حرکت نمایش می‌دهد).
*/
export default function Reveal({ children, delay = 0, y = 24, className = '', as: Tag = 'div' }: any) {
  const ref = useRef<any>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // اگر مرورگر IntersectionObserver ندارد یا حرکت کاهش‌یافته است، فوراً نمایش بده
    if (reduce || typeof IntersectionObserver === 'undefined') return setShown(true);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}

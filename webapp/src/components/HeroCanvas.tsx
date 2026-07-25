'use client';
import { Suspense, lazy, useEffect, useState } from 'react';

const Hero3D = lazy(() => import('./Hero3D'));

// آیا مرورگر WebGL دارد؟ (در SSR و jsdom نتیجه false است، پس صحنه‌ی ۳بعدی رندر نمی‌شود)
function hasWebGL() {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

// بارگذاری تنبل و امنِ صحنه‌ی سه‌بعدی — فقط سمت کلاینت و فقط اگر WebGL موجود باشد.
export default function HeroCanvas({ className = '' }: any) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(hasWebGL());
  }, []);

  if (!ok) return null;

  return (
    <Suspense fallback={null}>
      <Hero3D className={className} />
    </Suspense>
  );
}

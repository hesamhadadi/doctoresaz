'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/client';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';

const KEY = 'recent-products';

// ثبت بازدید محصول (در صفحه‌ی محصول صدا زده می‌شود)
export function trackView(slug: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, 12);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

// ردیف «بازدیدهای اخیر شما»
export default function RecentlyViewed({ exclude }: { exclude?: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    let slugs: string[] = [];
    try { slugs = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
    slugs = slugs.filter((s) => s !== exclude).slice(0, 6);
    if (!slugs.length) return;
    Promise.all(slugs.map((s) => apiGet(`/products/${encodeURIComponent(s)}`).catch(() => null)))
      .then((res) => setItems(res.filter(Boolean)));
  }, [exclude]);

  if (items.length < 2) return null;
  return (
    <section className="section pt-0">
      <div className="container">
        <SectionHeader eyebrow="ادامه‌ی جستجو" title="بازدیدهای اخیر شما" />
        <div className="no-bar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
          {items.map((p) => (
            <div key={p._id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/client';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';

// کاروسل افقی محصولات یک دسته/کوئری (الهام از ردیف‌های سازکالا)
export default function ProductRow({ query, eyebrow, title, href }: any) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    apiGet(`/products?${query}&limit=10`).then((d) => setItems(d.items || [])).catch(() => {});
  }, [query]);
  if (!items.length) return null;
  return (
    <section className="section pt-0">
      <div className="container">
        <SectionHeader eyebrow={eyebrow} title={title} href={href} />
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

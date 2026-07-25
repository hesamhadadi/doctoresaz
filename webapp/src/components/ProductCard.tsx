'use client';
import Link from 'next/link';
import { useState } from 'react';
import { mediaUrl } from '@/lib/client';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Icon from './ui/Icon';

export default function ProductCard({ product: p }: any) {
  const { add, loading } = useCart();
  const { has, toggle } = useWishlist();
  const [imgOk, setImgOk] = useState(true);
  const [adding, setAdding] = useState(false);
  const liked = has('product', p._id);
  const soldOut = p.variants?.length ? !p.variants.some((v: any) => v.stock > 0) : p.stock <= 0;
  const off = p.compareAtPrice > p.price ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0;
  const src = imgOk ? mediaUrl(p.coverImage) : mediaUrl(p.fallbackImage || '/instruments/setar.svg');

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setAdding(true);
    try { await add({ kind: 'product', id: p._id, qty: 1 }); } finally { setTimeout(() => setAdding(false), 500); }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-750 bg-ink-850 transition-all duration-200 hover:border-ink-600 hover:shadow-[0_4px_20px_-6px_rgb(var(--shadow)/.18)]">
      {/* تصویر — نسبت ۴:۳ تا کارت بیش‌ازحد بلند نشود */}
      <Link href={`/product/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-white">
        <img
          src={src} alt={p.title} loading="lazy" onError={() => setImgOk(false)}
          className={`h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105 ${soldOut ? 'opacity-40 grayscale' : ''}`}
        />
        {off > 0 && (
          <span className="num absolute right-2 top-2 rounded-md bg-danger px-1.5 py-0.5 text-[11px] text-white">
            ٪{off.toLocaleString('fa-IR')}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-2 bottom-2 rounded-md bg-ink-900/85 py-1 text-center text-[11px] text-white">ناموجود</span>
        )}
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); toggle('product', p._id); }}
        aria-label={liked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        className={`press absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink-850/85 backdrop-blur transition-colors ${liked ? 'text-danger' : 'text-ink-400 hover:text-ink-200'}`}
      >
        <Icon name="heart" size={16} filled={liked} />
      </button>

      {/* اطلاعات — فشرده */}
      <div className="flex flex-1 flex-col gap-1.5 border-t border-ink-800 p-3">
        {p.brand && <span className="text-[11px] leading-4 text-ink-400">{p.brand}</span>}
        <Link href={`/product/${p.slug}`} className="clamp-2 min-h-[36px] text-[12.5px] leading-[1.5] text-ink-100 transition-colors hover:text-firooze-600">
          {p.title}
        </Link>

        {p.ratingCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-ink-400">
            <Icon name="star" size={12} filled className="text-zaferan-500" />
            <span className="num">{p.ratingAvg.toLocaleString('fa-IR')}</span>
          </span>
        )}

        {/* قیمت + دکمه سبد */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {off > 0 && <div className="num text-[11px] leading-4 text-ink-500 line-through">{p.compareAtPrice.toLocaleString('fa-IR')}</div>}
            <div className="flex items-baseline gap-1">
              <span className="price num text-[15px]">{p.price.toLocaleString('fa-IR')}</span>
              <span className="text-[10px] text-ink-400">تومان</span>
            </div>
          </div>

          <button
            onClick={handleAdd} disabled={soldOut || adding || loading}
            aria-label="افزودن به سبد خرید"
            className="press grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-firooze-600 text-white transition-colors hover:bg-firooze-700 disabled:bg-ink-700 disabled:text-ink-500"
          >
            <Icon name={adding ? 'check' : 'cart'} size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

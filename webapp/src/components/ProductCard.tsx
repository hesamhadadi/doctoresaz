'use client';
import Link from 'next/link';
import { mediaUrl } from '@/lib/client';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import useTilt from '@/hooks/useTilt';
import Icon from './ui/Icon';
import Price from './ui/Price';
import Rating from './ui/Rating';

export default function ProductCard({ product: p }: any) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const tilt = useTilt({ max: 6 });
  const liked = has('product', p._id);
  const soldOut = p.variants?.length ? !p.variants.some((v) => v.stock > 0) : p.stock <= 0;
  const lowStock = !soldOut && (p.stock > 0 && p.stock <= 3);

  return (
    <article {...tilt} className="card-hover group relative flex flex-col overflow-hidden">
      <Link href={`/product/${p.slug}`} className="relative block overflow-hidden">
        <img
          src={mediaUrl(p.coverImage)}
          onError={(e) => { const t = e.currentTarget as HTMLImageElement; const fb = mediaUrl(p.fallbackImage); if (fb && t.src !== location.origin + fb && !t.src.endsWith(fb)) t.src = fb; }}
          alt={p.title}
          loading="lazy"
          className={`ratio-saz w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] ${
            soldOut ? 'opacity-45 grayscale' : ''
          }`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950/85 to-transparent" />

        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {p.compareAtPrice > p.price && (
            <span className="num badge bg-danger text-white shadow-soft">
              ٪{Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100).toLocaleString('fa-IR')}−
            </span>
          )}
          {soldOut && <span className="badge bg-ink-950/90 text-ink-300 ring-1 ring-inset ring-ink-600">ناموجود</span>}
          {lowStock && <span className="badge bg-zaferan-400/90 text-ink-950">تنها {p.stock.toLocaleString('fa-IR')} عدد</span>}
        </div>
      </Link>

      <button
        onClick={() => toggle('product', p._id)}
        aria-label={liked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        className={`glass absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl transition-all ${
          liked ? 'text-danger' : 'text-ink-200 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
        }`}
      >
        <Icon name="heart" size={17} filled={liked} />
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {p.brand && <span className="text-[11px] text-ink-400">{p.brand}</span>}
        <Link href={`/product/${p.slug}`} className="clamp-2 text-sm font-medium leading-6 text-ink-50 transition-colors hover:text-firooze-300">
          {p.title}
        </Link>
        {p.ratingCount > 0 && <Rating value={p.ratingAvg} count={p.ratingCount} size={13} />}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <Price value={p.price} compareAt={p.compareAtPrice} size="sm" />
          <button
            onClick={() => add({ kind: 'product', id: p._id, qty: 1 })}
            disabled={soldOut}
            aria-label="افزودن به سبد"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-firooze-500/12 text-firooze-300 ring-1 ring-inset ring-firooze-500/25 transition-all hover:bg-firooze-500 hover:text-ink-950 active:scale-95 disabled:opacity-30 disabled:hover:bg-firooze-500/12 disabled:hover:text-firooze-300"
          >
            <Icon name="cart" size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

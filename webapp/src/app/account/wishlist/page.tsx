'use client';
import Link from 'next/link';
import { mediaUrl } from '@/lib/client';
import { toman } from '@/lib/format';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/Icon';
import Empty from '@/components/ui/Empty';
import Price from '@/components/ui/Price';

export default function Wishlist() {
  const { products, books, toggle, count } = useWishlist();
  const { add } = useCart();

  return (
    <div>
      <header className="mb-7">
        <h1 className="mb-1.5 text-2xl">علاقه‌مندی‌ها</h1>
        <p className="text-sm text-ink-400">محصولات و دوره‌هایی که برای بعد ذخیره کرده‌اید</p>
      </header>

      {count === 0 ? (
        <Empty icon="heart" title="لیست علاقه‌مندی‌ها خالی است" description="با زدن آیکون قلب روی هر محصول، آن را اینجا ذخیره کنید." action="رفتن به فروشگاه" href="/shop" />
      ) : (
        <div className="space-y-9">
          {products.length > 0 && (
            <section>
              <h2 className="mb-4 text-base">محصولات</h2>
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p._id} className="card flex items-center gap-4 p-3.5">
                    <Link href={`/product/${p.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-800">
                      <img src={mediaUrl(p.coverImage)} alt="" className="h-full w-full object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${p.slug}`} className="clamp-2 mb-2 text-[13px] font-medium text-ink-50 hover:text-firooze-300">
                        {p.title}
                      </Link>
                      <Price value={p.price} compareAt={p.compareAtPrice} size="sm" />
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => add({ kind: 'product', id: p._id, qty: 1 })}
                        disabled={p.stock <= 0}
                        className="btn-primary btn-sm whitespace-nowrap"
                      >
                        <Icon name="cart" size={14} /> {p.stock > 0 ? 'افزودن' : 'ناموجود'}
                      </button>
                      <button onClick={() => toggle('product', p._id)} className="btn-ghost btn-sm text-xs text-ink-400 hover:text-danger">
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {books.length > 0 && (
            <section>
              <h2 className="mb-4 text-base">دوره‌ها و کتاب‌ها</h2>
              <div className="space-y-3">
                {books.map((b) => (
                  <div key={b._id} className="card flex items-center gap-4 p-3.5">
                    <Link href={`/book/${b._id}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-800">
                      {b.coverImage ? <img src={mediaUrl(b.coverImage)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink-600"><Icon name="book" size={22} /></div>}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/book/${b._id}`} className="clamp-2 mb-1.5 text-[13px] font-medium text-ink-50 hover:text-firooze-300">{b.title}</Link>
                      <p className="num text-sm font-bold text-ink-100">{toman(b.price)}</p>
                    </div>
                    <button onClick={() => toggle('book', b._id)} className="btn-ghost btn-sm shrink-0 text-xs text-ink-400 hover:text-danger">حذف</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

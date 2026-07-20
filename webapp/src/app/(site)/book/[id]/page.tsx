'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, num } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Icon from '@/components/ui/Icon';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { SkeletonLines } from '@/components/ui/Skeleton';

const ASSETS = [
  { key: 'introVideo', label: 'ویدیو معرفی', icon: 'video' },
  { key: 'pdf', label: 'نت PDF', icon: 'file' },
  { key: 'lessonVideo', label: 'ویدیو آموزش', icon: 'play' },
  { key: 'audioGuide', label: 'فایل صوتی', icon: 'headphones' },
];

export default function BookPage() {
  const { id } = useParams();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    apiGet(`/books/${id}`).then((data) => setBook(data)).catch(() => setBook(false));
  }, [id]);

  if (book === null) return <div className="container py-10"><SkeletonLines count={5} /></div>;
  if (book === false) return <div className="container py-24 text-center"><h2>کتاب یافت نشد</h2></div>;

  const owned = book.pieces?.length > 0 && book.pieces.every((p) => p.owned);
  const freeCount = book.pieces?.filter((p) => !p.owned).length || 0;
  const liked = has('book', book._id);

  return (
    <div className="container py-8">
      <Breadcrumb
        items={[
          { to: '/learn', label: 'آموزش' },
          ...(book.instrument ? [{ to: `/saz/${book.instrument.slug}`, label: book.instrument.name }] : []),
          { label: book.title },
        ]}
      />

      <div className="mb-10 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-ink-750 bg-ink-850">
            {book.coverImage ? (
              <img src={mediaUrl(book.coverImage)} alt="" className="ratio-saz w-full object-cover" />
            ) : (
              <div className="ratio-saz grid w-full place-items-center text-ink-600"><Icon name="book" size={48} /></div>
            )}
          </div>
        </div>

        <div>
          <span className="eyebrow">{book.instrument?.name}</span>
          <h1 className="mb-3">{book.title}</h1>
          {book.author && <p className="mb-4 text-[13px] text-ink-400">مدرس: {book.author}</p>}
          <p className="mb-6 text-[15px] leading-8 text-ink-300">{book.description}</p>

          <div className="mb-6 flex flex-wrap gap-2.5 text-[12px]">
            <span className="badge-neutral"><Icon name="music" size={13} /> {num(book.pieces?.length || 0)} قطعه</span>
            {owned ? (
              <span className="badge-free"><Icon name="checkCircle" size={13} /> شما این کتاب را دارید</span>
            ) : (
              <span className="badge-free"><Icon name="unlock" size={13} /> ویدیو معرفی و نت رایگان است</span>
            )}
          </div>

          {!owned && book.price > 0 && (
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs text-ink-400">خرید کل کتاب</p>
                  <p className="num text-2xl font-bold text-ink-50">{toman(book.price)}</p>
                </div>
                <p className="max-w-[180px] text-left text-[11px] leading-5 text-ink-400">
                  دسترسی دائمی به تمام {num(book.pieces?.length || 0)} قطعه، ارزان‌تر از خرید تکی
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => add({ kind: 'book', id: book._id })} className="btn-primary flex-1">
                  <Icon name="cart" size={17} /> افزودن به سبد
                </button>
                <button
                  onClick={() => toggle('book', book._id)}
                  aria-label="علاقه‌مندی"
                  className={`btn-outline btn-icon ${liked ? 'border-danger/40 text-danger' : ''}`}
                >
                  <Icon name="heart" size={17} filled={liked} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* فهرست قطعات */}
      <section>
        <h2 className="mb-5 text-xl">فهرست قطعات</h2>
        <div className="space-y-2.5">
          {book.pieces?.map((p, i) => (
            <Link key={p._id} href={`/piece/${p._id}`} className="card-hover group flex flex-wrap items-center gap-4 p-4">
              <span className="num grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-800 text-sm font-bold text-ink-300 transition-colors group-hover:bg-firooze-500/15 group-hover:text-firooze-300">
                {(i + 1).toLocaleString('fa-IR')}
              </span>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[14px] font-medium text-ink-50">{p.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ASSETS.map((a) => {
                    const asset = p[a.key];
                    if (!asset?.exists) return null;
                    return (
                      <span
                        key={a.key}
                        className={`badge ${asset.locked ? 'bg-ink-800 text-ink-500 ring-1 ring-inset ring-ink-700' : 'bg-firooze-500/12 text-firooze-300 ring-1 ring-inset ring-firooze-500/25'}`}
                      >
                        <Icon name={asset.locked ? 'lock' : a.icon} size={10} />
                        {a.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {p.owned ? (
                  <span className="badge-free"><Icon name="check" size={11} /> خریداری‌شده</span>
                ) : (
                  <span className="num text-[13px] text-ink-300">{toman(p.price)}</span>
                )}
                <Icon name="chevronLeft" size={17} className="text-ink-500 transition-transform group-hover:-translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

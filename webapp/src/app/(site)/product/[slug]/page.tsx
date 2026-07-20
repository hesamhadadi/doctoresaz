'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, faDate, num } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Gallery from '@/components/ui/Gallery';
import Icon from '@/components/ui/Icon';
import Price from '@/components/ui/Price';
import Rating from '@/components/ui/Rating';
import QtyStepper from '@/components/ui/QtyStepper';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductCard from '@/components/ProductCard';
import { SkeletonLines } from '@/components/ui/Skeleton';

const TABS = [
  { key: 'desc', label: 'توضیحات' },
  { key: 'specs', label: 'مشخصات' },
  { key: 'reviews', label: 'نظرات' },
];

export default function ProductPage() {
  const { slug } = useParams();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();

  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');

  useEffect(() => {
    setLoading(true);
    setQty(1);
    apiGet(`/products/${slug}`)
      .then((data) => {
        setP(data);
        setVariantId(data.variants?.find((v) => v.stock > 0)?._id || null);
      })
      .catch(() => setP(null))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container grid gap-10 py-10 lg:grid-cols-2">
        <div className="skeleton ratio-saz w-full" />
        <SkeletonLines count={6} />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="container py-24 text-center">
        <h2 className="mb-3">محصول یافت نشد</h2>
        <Link href="/shop" className="btn-outline">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  const variant = p.variants?.find((v) => String(v._id) === String(variantId));
  const price = p.price + (variant?.priceDiff || 0);
  const stock = variant ? variant.stock : p.stock;
  const soldOut = stock <= 0;
  const liked = has('product', p._id);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const data = await apiPost(`/products/${p._id}/reviews`, { rating: myRating, comment: myComment });
      setP({ ...p, ratingAvg: data.ratingAvg, ratingCount: data.ratingCount });
      setMyComment('');
      toast.success('نظر شما ثبت شد. ممنون!');
    } catch (err: any) {
      toast.error((err as any).message || 'ثبت نظر ناموفق بود');
    }
  };

  return (
    <div className="container py-8">
      <Breadcrumb
        items={[
          { to: '/shop', label: 'فروشگاه' },
          ...(p.category ? [{ to: `/shop?category=${p.category.slug}`, label: p.category.name }] : []),
          { label: p.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Gallery media={p.gallery} cover={p.coverImage} title={p.title} />
        </div>

        <div>
          {p.brand && (
            <span className="mb-2.5 inline-flex items-center gap-1.5 text-xs text-ink-400">
              <Icon name="award" size={14} className="text-zaferan-400" />
              {p.brand}{p.maker && ` — ${p.maker}`}
            </span>
          )}

          <h1 className="mb-3 text-2xl leading-[1.4] sm:text-3xl">{p.title}</h1>

          <div className="mb-5 flex flex-wrap items-center gap-4">
            <Rating value={p.ratingAvg} count={p.ratingCount} />
            {p.soldCount > 0 && <span className="num text-xs text-ink-400">{num(p.soldCount)} فروش موفق</span>}
          </div>

          {p.shortDescription && (
            <p className="mb-6 border-r-2 border-firooze-500/40 pr-4 text-[15px] leading-8 text-ink-200">
              {p.shortDescription}
            </p>
          )}

          {/* تنوع */}
          {p.variants?.length > 0 && (
            <div className="mb-6">
              <p className="label">انتخاب نوع</p>
              <div className="flex flex-wrap gap-2">
                {p.variants.map((v) => {
                  const off = v.stock <= 0;
                  const on = String(v._id) === String(variantId);
                  return (
                    <button
                      key={v._id}
                      onClick={() => !off && setVariantId(v._id)}
                      disabled={off}
                      className={`rounded-xl border px-4 py-2.5 text-[13px] transition-all ${
                        on
                          ? 'border-firooze-500 bg-firooze-500/10 text-firooze-200'
                          : off
                          ? 'border-ink-800 text-ink-600 line-through'
                          : 'border-ink-700 text-ink-200 hover:border-ink-500'
                      }`}
                    >
                      {v.name}
                      {v.priceDiff > 0 && <span className="num mr-1.5 text-[11px] text-ink-400">+{v.priceDiff.toLocaleString('fa-IR')}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* جعبه‌ی خرید */}
          <div className="panel mb-6 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Price value={price} compareAt={p.compareAtPrice ? p.compareAtPrice + (variant?.priceDiff || 0) : 0} size="lg" />
              {soldOut ? (
                <span className="badge-danger">ناموجود</span>
              ) : stock <= 3 ? (
                <span className="badge-paid">تنها {num(stock)} عدد باقی مانده</span>
              ) : (
                <span className="badge-free"><Icon name="check" size={12} /> موجود در انبار</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!soldOut && <QtyStepper value={qty} onChange={setQty} max={stock} />}
              <button
                onClick={() => add({ kind: 'product', id: p._id, variantId, qty })}
                disabled={soldOut}
                className="btn-primary btn-lg flex-1"
              >
                <Icon name="cart" size={19} />
                {soldOut ? 'ناموجود' : 'افزودن به سبد خرید'}
              </button>
              <button
                onClick={() => toggle('product', p._id)}
                aria-label="علاقه‌مندی"
                className={`btn-outline btn-lg btn-icon ${liked ? 'border-danger/40 text-danger' : ''}`}
              >
                <Icon name="heart" size={19} filled={liked} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-800 pt-4 text-[11px] text-ink-400">
              <span className="flex items-center gap-1.5"><Icon name="truck" size={14} className="text-firooze-400" /> ارسال ۳ تا ۵ روز کاری</span>
              <span className="flex items-center gap-1.5"><Icon name="shield" size={14} className="text-firooze-400" /> ضمانت اصالت کالا</span>
              <span className="flex items-center gap-1.5"><Icon name="refresh" size={14} className="text-firooze-400" /> ۷ روز مهلت بازگشت</span>
              <span className="flex items-center gap-1.5"><Icon name="headphones" size={14} className="text-firooze-400" /> مشاوره‌ی رایگان</span>
            </div>
          </div>

          {/* لینک به آموزش همان ساز */}
          {p.instrument && (
            <Link
              href={`/saz/${p.instrument.slug}`}
              className="group mb-6 flex items-center gap-3 rounded-2xl border border-zaferan-400/25 bg-zaferan-400/[.06] p-4 transition-colors hover:border-zaferan-400/50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zaferan-400/15 text-zaferan-300">
                <Icon name="book" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink-50">آموزش {p.instrument.name} را ببینید</p>
                <p className="text-[11px] text-ink-400">ویدیو، نت و فایل صوتی — بخشی رایگان</p>
              </div>
              <Icon name="arrowLeft" size={17} className="text-zaferan-300 transition-transform group-hover:-translate-x-1" />
            </Link>
          )}

          {/* تب‌ها */}
          <div className="border-b border-ink-800">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative px-4 py-3 text-sm transition-colors ${
                    tab === t.key ? 'font-medium text-firooze-300' : 'text-ink-400 hover:text-ink-100'
                  }`}
                >
                  {t.label}
                  {t.key === 'reviews' && p.ratingCount > 0 && (
                    <span className="num mr-1 text-[10px] text-ink-500">({num(p.ratingCount)})</span>
                  )}
                  {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-firooze-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="py-6">
            {tab === 'desc' && (
              <p className="whitespace-pre-line text-[14px] leading-8 text-ink-200">
                {p.description || 'توضیحی ثبت نشده است.'}
              </p>
            )}

            {tab === 'specs' && (
              <dl className="overflow-hidden rounded-xl border border-ink-800">
                {p.specs?.length ? (
                  p.specs.map((s, i) => (
                    <div key={i} className={`flex gap-4 px-4 py-3 text-[13px] ${i % 2 ? 'bg-ink-850/40' : ''}`}>
                      <dt className="w-32 shrink-0 text-ink-400">{s.key}</dt>
                      <dd className="text-ink-100">{s.value}</dd>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-ink-400">مشخصاتی ثبت نشده است.</p>
                )}
              </dl>
            )}

            {tab === 'reviews' && (
              <div className="space-y-5">
                {user && (
                  <form onSubmit={submitReview} className="card p-4">
                    <p className="label">امتیاز شما</p>
                    <div className="mb-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} type="button" onClick={() => setMyRating(i)} aria-label={`${i} ستاره`}>
                          <Icon name="star" size={26} filled={i <= myRating} className={i <= myRating ? 'text-zaferan-400' : 'text-ink-600'} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="تجربه‌ی خود را از این محصول بنویسید…"
                      className="textarea mb-3"
                    />
                    <button className="btn-primary btn-sm">ثبت نظر</button>
                  </form>
                )}

                {p.reviews?.length ? (
                  p.reviews.map((r) => (
                    <div key={r._id} className="border-b border-ink-800 pb-5 last:border-0">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-firooze-500/12 text-xs font-bold text-firooze-300">
                          {r.user?.name?.charAt(0) || '؟'}
                        </span>
                        <div>
                          <p className="flex items-center gap-2 text-[13px] text-ink-100">
                            {r.user?.name || 'کاربر'}
                            {r.isVerifiedBuyer && <span className="badge-free">خریدار</span>}
                          </p>
                          <p className="text-[11px] text-ink-500">{faDate(r.createdAt)}</p>
                        </div>
                        <Rating value={r.rating} showCount={false} size={13} className="mr-auto" />
                      </div>
                      <p className="pr-12 text-[13px] leading-7 text-ink-300">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-ink-400">هنوز نظری ثبت نشده. اولین نفر باشید!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {p.related?.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl">محصولات مشابه</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {p.related.slice(0, 4).map((r) => <ProductCard key={r._id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

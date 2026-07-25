'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, num } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Empty from '@/components/ui/Empty';
import ProductCard from '@/components/ProductCard';
import { Shamse, ShamseDivider } from '@/components/ui/Shamse';
import { SkeletonLines } from '@/components/ui/Skeleton';

export default function InstrumentPage() {
  const { slug } = useParams();
  const [ins, setIns] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    apiGet(`/instruments/${slug}`).then((data) => {
      setIns(data);
      apiGet(`/products?instrument=${data._id}&limit=4`).then((r) => setProducts(r.data.items)).catch(() => {});
    }).catch(() => setIns(false));
  }, [slug]);

  if (ins === null) return <div className="container py-10"><SkeletonLines count={5} /></div>;
  if (ins === false) return <div className="container py-24 text-center"><h2 className="mb-4">ساز یافت نشد</h2><Link href="/learn" className="btn-outline">همه‌ی سازها</Link></div>;

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ to: '/learn', label: 'آموزش' }, { label: ins.name }]} />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-ink-750 bg-grad-ink p-8 sm:p-10">
        <Shamse className="pointer-events-none absolute -left-14 -top-14 animate-spin-slow text-firooze-400" size={280} opacity={0.06} />
        <div className="relative max-w-2xl">
          <span className="eyebrow">دوره‌ی تخصصی</span>
          <h1 className="mb-4">{ins.name}</h1>
          <p className="text-[15px] leading-8 text-ink-300">{ins.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-[12px]">
            <span className="badge-neutral"><Icon name="book" size={13} /> {num(ins.books?.length || 0)} کتاب</span>
            <span className="badge-free"><Icon name="unlock" size={13} /> بخش رایگان دارد</span>
          </div>
        </div>
      </header>

      {/* ویدیوهای معرفی رایگان */}
      {ins.introVideos?.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-xl">ویدیوهای معرفی <span className="badge-free mr-2">رایگان</span></h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ins.introVideos.map((v, i) => (
              <div key={i} className="card overflow-hidden">
                <video src={mediaUrl(v.url)} controls playsInline className="aspect-video w-full bg-black" />
                <p className="p-3.5 text-[13px] text-ink-100">{v.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* کتاب‌ها */}
      <section className="mb-14">
        <h2 className="mb-5 text-xl">کتاب‌های آموزشی</h2>
        {!ins.books?.length ? (
          <Empty icon="book" title="هنوز کتابی منتشر نشده" description="به‌زودی دوره‌های این ساز اضافه می‌شوند." />
        ) : (
          <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ins.books.map((b) => (
              <Link key={b._id} href={`/book/${b._id}`} className="card-hover group overflow-hidden">
                <div className="relative h-40 overflow-hidden bg-ink-800">
                  {b.coverImage ? (
                    <img src={mediaUrl(b.coverImage)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-ink-600"><Icon name="book" size={38} /></div>
                  )}
                  <div className="absolute inset-0 bg-grad-fade" />
                </div>
                <div className="p-5">
                  <h3 className="mb-1.5 text-base">{b.title}</h3>
                  <p className="clamp-2 mb-4 text-[12px] leading-6 text-ink-400">{b.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="num text-base font-bold text-firooze-300">{toman(b.price)}</span>
                    <Icon name="arrowLeft" size={17} className="text-ink-500 transition-transform group-hover:-translate-x-1.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* محصولات مرتبط */}
      {products.length > 0 && (
        <>
          <ShamseDivider className="mb-10" />
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl">{ins.name} بخرید</h2>
                <p className="mt-1.5 text-[13px] text-ink-400">ساز و لوازم جانبی مرتبط با این دوره</p>
              </div>
              <Link href={`/shop?instrument=${ins._id}`} className="text-sm text-firooze-300 hover:text-firooze-200">مشاهده‌ی همه</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

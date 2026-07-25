'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { num, toman } from '@/lib/format';
import { catImage } from '@/lib/catImage';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import PromoBanners from '@/components/PromoBanners';
import TrustBar from '@/components/TrustBar';
import ProductRow from '@/components/ProductRow';
import Reveal from '@/components/ui/Reveal';
import Icon from '@/components/ui/Icon';
import { SkeletonGrid } from '@/components/ui/Skeleton';

export default function Home() {
  const [featured, setFeatured] = useState<any>(null);
  const [newest, setNewest] = useState<any>(null);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    apiGet('/products?featured=1&limit=8').then((data) => setFeatured(data.items)).catch(() => setFeatured([]));
    apiGet('/products?sort=newest&limit=8').then((data) => setNewest(data.items)).catch(() => setNewest([]));
    apiGet('/instruments').then((data) => setInstruments(data)).catch(() => {});
    apiGet('/categories?tree=1').then((data) => setCats(data)).catch(() => {});
    apiGet('/packages').then((data) => setPackages(data)).catch(() => {});
  }, []);

  return (
    <>
      {/* ─────────── بنر اصلی ─────────── */}
      <div className="pt-4"><PromoBanners /></div>

      {/* ─────────── میان‌بر دسته‌ها ─────────── */}
      {cats.length > 0 && (
        <div className="container mt-5">
          <div className="no-bar flex gap-4 overflow-x-auto pb-1 sm:justify-center sm:gap-7">
            {cats.flatMap((c) => [c, ...(c.children || [])]).slice(0, 9).map((c) => {
              const img = catImage(c.slug, c.image);
              return (
                <Link key={c._id} href={`/shop?category=${c.slug}`} className="group flex w-[72px] shrink-0 flex-col items-center gap-2 text-center">
                  <span className="grid h-[70px] w-[70px] place-items-center overflow-hidden rounded-full bg-white ring-1 ring-ink-750 transition-all duration-200 group-hover:ring-2 group-hover:ring-firooze-500">
                    {img ? (
                      <img src={img} alt={c.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <Icon name={c.icon || 'music'} size={24} className="text-firooze-600" />
                    )}
                  </span>
                  <span className="text-[11px] leading-4 text-ink-300 transition-colors group-hover:text-firooze-600">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────── نوار اعتماد ─────────── */}
      <TrustBar />

      {/* ─────────── کاروسل گیتار الکتریک ─────────── */}
      <ProductRow query="category=گیتار-الکتریک&sort=newest" eyebrow="جدید در فروشگاه" title="گیتار الکتریک" href="/shop?category=گیتار-الکتریک" />

      {/* ─────────── دسته‌بندی‌ها ─────────── */}
      {cats.length > 0 && (
        <section className="pb-7 sm:pb-9">
          <div className="container">
            <SectionHeader title="خرید بر اساس دسته‌بندی" description="از ساز تا لوازم جانبی و منابع آموزشی" href="/shop" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cats.flatMap((c) => [c, ...(c.children || [])]).slice(0, 8).map((c, i) => {
                const img = catImage(c.slug, c.image);
                const tints = ['bg-firooze-500/8', 'bg-zaferan-500/8', 'bg-lajvard-500/8', 'bg-ajori-500/8'];
                return (
                  <Link key={c._id} href={`/shop?category=${c.slug}`}
                    className="card-hover group relative flex flex-col overflow-hidden">
                    <div className={`relative flex h-28 items-center justify-center ${tints[i % 4]}`}>
                      {img ? (
                        <img src={img} alt={c.name} loading="lazy"
                          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <Icon name={c.icon || 'package'} size={30} className="text-firooze-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-ink-800 px-3.5 py-3">
                      <div className="min-w-0">
                        <h3 className="clamp-1 text-[13px]">{c.name}</h3>
                        <p className="num mt-0.5 text-[11px] text-ink-400">{num(c.productCount ?? 0)} کالا</p>
                      </div>
                      <Icon name="arrowLeft" size={15} className="shrink-0 text-ink-500 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── محصولات ویژه ─────────── */}
      <section className="pb-7 sm:pb-9">
        <div className="container">
          <SectionHeader
            title="سازهای ویژه"
            description="سازهایی که خودمان امتحان کرده‌ایم و با اطمینان پیشنهاد می‌دهیم."
            href="/shop?featured=1"
          />
          {featured === null ? (
            <SkeletonGrid count={5} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {featured.slice(0, 5).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─────────── سازها / آموزش ─────────── */}
      {instruments.length > 0 && (
        <section className="border-y border-ink-750 bg-ink-900 py-8 sm:py-10">
          <div className="container">
            <SectionHeader
              title="کدام ساز را می‌خواهید بیاموزید؟"
              description="هر ساز، چند کتاب دارد و هر کتاب چند قطعه. ویدیوی معرفی و نت PDF هر قطعه رایگان است."
              href="/learn"
            />

            <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {instruments.map((ins) => (
                <Link key={ins._id} href={`/saz/${ins.slug}`} className="card-hover group overflow-hidden text-center">
                  <div className="relative aspect-square overflow-hidden bg-white">
                    {ins.coverImage ? (
                      <img src={mediaUrl(ins.coverImage)} alt={ins.name} loading="lazy" className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center text-firooze-500/40"><Icon name="music" size={30} /></div>
                    )}
                    
                  </div>
                  <div className="p-3.5">
                    <h3 className="mb-1 flex items-center justify-center gap-1.5 text-[15px]">
                      {ins.name}
                      <Icon name="arrowLeft" size={14} className="text-firooze-400 transition-transform group-hover:-translate-x-1" />
                    </h3>
                    <p className="clamp-2 text-[11px] leading-5 text-ink-400">{ins.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── پکیج‌ها ─────────── */}
      {packages.length > 0 && (
        <section className="pb-7 sm:pb-9">
          <div className="container">
            <SectionHeader
              title="پکیج‌های کامل"
              description="یک‌بار بخرید، به همه‌ی محتوای آن ساز دسترسی دائمی داشته باشید."
              href="/packages"
            />
            <div className="grid gap-3 md:grid-cols-3">
              {packages.slice(0, 3).map((pkg) => (
                <Link key={pkg._id} href="/packages" className="card-hover group relative overflow-hidden">
                  <div className="relative h-36 overflow-hidden bg-ink-800">
                    {pkg.coverImage ? (
                      <img src={mediaUrl(pkg.coverImage)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center text-ink-600"><Icon name="layers" size={32} /></div>
                    )}
                    <div className="absolute inset-0 bg-grad-fade" />
                    <span className="badge-paid absolute right-3 top-3"><Icon name="sparkle" size={11} /> پکیج کامل</span>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-1.5 text-base">{pkg.title}</h3>
                    <p className="clamp-2 mb-4 text-[12px] leading-6 text-ink-400">{pkg.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="num text-lg font-bold text-firooze-300">{toman(pkg.price)}</span>
                      <Icon name="arrowLeft" size={17} className="text-ink-500 transition-transform group-hover:-translate-x-1.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── تازه‌ها ─────────── */}
      <section className="pb-7 sm:pb-9">
        <div className="container">
          <SectionHeader title="جدیدترین محصولات" href="/shop?sort=newest" />
          {newest === null ? (
            <SkeletonGrid count={5} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {newest.slice(0, 5).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─────────── پرفروش‌ترین‌ها ─────────── */}
      <ProductRow query="sort=popular" eyebrow="محبوب کاربران" title="پرفروش‌ترین محصولات" href="/shop?sort=popular" />

      {/* ─────────── فراخوان پایانی ─────────── */}
      <Reveal as="section" className="container pb-20">
        <div className="panel relative overflow-hidden px-6 py-14 text-center sm:px-12">

          <div className="relative mx-auto max-w-xl">
            <h2 className="mb-4">اولین قطعه‌تان را همین امروز بنوازید</h2>
            <p className="mb-8 text-[15px] leading-8 text-ink-300">
              ویدیوی معرفی و نت PDF همه‌ی قطعات رایگان است. ثبت‌نام کنید، امتحان کنید،
              و اگر پسندیدید ادامه‌ی دوره را تهیه کنید.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn-primary btn-lg">شروع رایگان</Link>
              <Link href="/learn" className="btn-outline btn-lg">مشاهده‌ی دوره‌ها</Link>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}

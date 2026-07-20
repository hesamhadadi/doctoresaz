'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { num, toman } from '@/lib/format';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import PromoBanners from '@/components/PromoBanners';
import ProductRow from '@/components/ProductRow';
import Reveal from '@/components/ui/Reveal';
import Icon from '@/components/ui/Icon';
import { Shamse, Strings, ShamseDivider } from '@/components/ui/Shamse';
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
      {/* ─────────── هیرو (ساکن و تمیز) ─────────── */}
      <section className="relative overflow-hidden">
        <Shamse className="pointer-events-none absolute -left-32 -top-24 animate-spin-slow text-firooze-500" size={480} opacity={0.06} />
        <Shamse className="pointer-events-none absolute -right-24 top-40 text-zaferan-400" size={280} opacity={0.05} />

        <div className="container relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          {/* متن */}
          <div>
            <span className="eyebrow animate-fade-up">
              <Strings count={5} className="text-firooze-500" />
              ساز، آموزش، و یک عمر همراهی
            </span>
            <h1 className="animate-fade-up text-[2rem] leading-[1.25] sm:text-5xl lg:text-[3.4rem]" style={{ animationDelay: '.05s' }}>
              ساز خوب بخر.
              <br />
              <span className="text-grad">درست نواختن را یاد بگیر.</span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-[15px] leading-8 text-ink-300 sm:text-base" style={{ animationDelay: '.1s' }}>
              سازهای دست‌ساز از کارگاه‌های معتبر ایران، در کنار دوره‌های ویدیویی گام‌به‌گام
              با نت، فایل صوتی و مضراب‌گذاری دقیق. بخش زیادی از آموزش‌ها رایگان است — اول امتحان کنید.
            </p>
            <div className="mt-9 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: '.15s' }}>
              <Link href="/shop" className="btn-primary btn-lg"><Icon name="package" size={19} /> ورود به فروشگاه</Link>
              <Link href="/learn" className="btn-outline btn-lg"><Icon name="play" size={18} filled /> آموزش‌های رایگان</Link>
            </div>
            <dl className="mt-12 grid max-w-lg animate-fade-up grid-cols-3 gap-6" style={{ animationDelay: '.2s' }}>
              {[{ n: '+۱۰۰', l: 'محصول تخصصی' }, { n: '+۱۲۰', l: 'قطعه‌ی آموزشی' }, { n: '+۲۰۰۰', l: 'هنرجوی فعال' }].map((s) => (
                <div key={s.l}>
                  <dt className="num text-2xl font-black text-firooze-500 sm:text-3xl">{s.n}</dt>
                  <dd className="mt-1 text-[11px] text-ink-400">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* تصویر ساز — کارت شیشه‌ای تمیز به‌جای صحنه‌ی سه‌بعدی */}
          <div className="relative hidden animate-scale-in lg:block" style={{ animationDelay: '.1s' }}>
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-grad-firooze opacity-15 blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-ink-750 bg-ink-850 shadow-lift">
                <img src="/instruments/setar.svg" alt="سه‌تار دست‌ساز" className="aspect-[4/5] w-full object-cover" />
              </div>
              {/* نشان شناور */}
              <div className="glass absolute -bottom-4 right-6 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lift">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-firooze-500 text-white"><Icon name="award" size={17} /></span>
                <div className="leading-tight">
                  <p className="text-[12px] font-semibold text-ink-50">ضمانت اصالت</p>
                  <p className="text-[10px] text-ink-400">مستقیم از کارگاه</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container relative"><ShamseDivider /></div>
      </section>

      {/* ─────────── بنر تبلیغاتی ─────────── */}
      <PromoBanners />

      {/* ─────────── کاروسل گیتار الکتریک ─────────── */}
      <ProductRow query="category=گیتار-الکتریک&sort=newest" eyebrow="جدید در فروشگاه" title="گیتار الکتریک" href="/shop?category=گیتار-الکتریک" />

      {/* ─────────── دسته‌بندی‌ها ─────────── */}
      {cats.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader
              eyebrow="فروشگاه"
              title="از کجا شروع کنیم؟"
              description="سازها، لوازم جانبی و منابع آموزشی — همه دسته‌بندی‌شده و قابل مقایسه."
              href="/shop"
            />

            <div className="reveal-grid grid gap-4 sm:grid-cols-3">
              {cats.map((c, i) => (
                <Link
                  key={c._id}
                  href={`/shop?category=${c.slug}`}
                  className="card-hover group relative overflow-hidden p-6"
                >
                  <Shamse className="absolute -left-8 -top-8 text-firooze-400 transition-transform duration-700 group-hover:rotate-45" size={150} opacity={0.06} />
                  <span className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ring-1 ring-inset ${
                    i % 2 ? 'bg-zaferan-400/10 text-zaferan-300 ring-zaferan-400/20' : 'bg-firooze-500/10 text-firooze-300 ring-firooze-500/20'
                  }`}>
                    <Icon name={c.icon || 'package'} size={22} />
                  </span>
                  <h3 className="mb-1.5 text-lg">{c.name}</h3>
                  <p className="clamp-2 mb-4 text-[13px] leading-6 text-ink-400">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="num text-[11px] text-ink-500">{num(c.totalCount ?? c.productCount)} محصول</span>
                    <Icon name="arrowLeft" size={17} className="text-firooze-400 transition-transform group-hover:-translate-x-1.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── محصولات ویژه ─────────── */}
      <section className="section pt-0">
        <div className="container">
          <SectionHeader
            eyebrow="منتخب استاد"
            title="سازهای ویژه"
            description="سازهایی که خودمان امتحان کرده‌ایم و با اطمینان پیشنهاد می‌دهیم."
            href="/shop?featured=1"
          />
          {featured === null ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="reveal-grid grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {featured.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─────────── سازها / آموزش ─────────── */}
      {instruments.length > 0 && (
        <section className="relative overflow-hidden border-y border-ink-800 bg-ink-900/30 py-16 sm:py-20">
          <div className="container">
            <SectionHeader
              eyebrow="مدرسه‌ی دکتر ساز"
              title="کدام ساز را می‌خواهید بیاموزید؟"
              description="هر ساز، چند کتاب دارد و هر کتاب چند قطعه. ویدیوی معرفی و نت PDF هر قطعه رایگان است."
              href="/learn"
            />

            <div className="reveal-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {instruments.map((ins) => (
                <Link key={ins._id} href={`/saz/${ins.slug}`} className="card-hover group overflow-hidden text-center">
                  <div className="relative aspect-square overflow-hidden bg-ink-900">
                    {ins.coverImage ? (
                      <img src={mediaUrl(ins.coverImage)} alt={ins.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="grid h-full place-items-center text-firooze-500/40"><Icon name="music" size={30} /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
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
        <section className="section">
          <div className="container">
            <SectionHeader
              eyebrow="صرفه‌جویی"
              title="پکیج‌های کامل"
              description="یک‌بار بخرید، به همه‌ی محتوای آن ساز دسترسی دائمی داشته باشید."
              href="/packages"
            />
            <div className="reveal-grid grid gap-4 md:grid-cols-3">
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
      <section className="section pt-0">
        <div className="container">
          <SectionHeader eyebrow="تازه رسیده" title="جدیدترین محصولات" href="/shop?sort=newest" />
          {newest === null ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="reveal-grid grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {newest.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─────────── پرفروش‌ترین‌ها ─────────── */}
      <ProductRow query="sort=popular" eyebrow="محبوب کاربران" title="پرفروش‌ترین محصولات" href="/shop?sort=popular" />

      {/* ─────────── فراخوان پایانی ─────────── */}
      <Reveal as="section" className="container pb-20">
        <div className="panel relative overflow-hidden px-6 py-14 text-center sm:px-12">
          <Shamse className="pointer-events-none absolute -right-16 -top-16 animate-spin-slow text-zaferan-400" size={300} opacity={0.05} />
          <Shamse className="pointer-events-none absolute -bottom-20 -left-16 text-firooze-400" size={260} opacity={0.05} />

          <div className="relative mx-auto max-w-xl">
            <Strings count={7} className="mx-auto mb-5 text-firooze-400" />
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

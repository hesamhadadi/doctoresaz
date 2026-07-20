'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/Icon';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Empty from '@/components/ui/Empty';
import { Shamse, Strings } from '@/components/ui/Shamse';
import { SkeletonGrid } from '@/components/ui/Skeleton';

const PERKS = [
  'دسترسی دائمی، بدون تاریخ انقضا',
  'همه‌ی ویدیوهای آموزش و فایل‌های صوتی',
  'نت PDF همه‌ی قطعات',
  'محتوای جدیدی که بعداً اضافه شود',
];

export default function PackagesPage() {
  const { add } = useCart();
  const [packages, setPackages] = useState<any>(null);

  useEffect(() => {
    apiGet('/packages').then((data) => setPackages(data)).catch(() => setPackages([]));
  }, []);

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'پکیج‌ها' }]} />

      <header className="mb-10 max-w-2xl">
        <span className="eyebrow"><Strings count={4} className="text-firooze-400" /> به‌صرفه‌ترین انتخاب</span>
        <h1 className="mb-4">پکیج‌های آموزشی</h1>
        <p className="text-[15px] leading-8 text-ink-300">
          به‌جای خرید قطعه‌به‌قطعه، یک‌بار پکیج بگیرید و به تمام محتوای آن ساز یا کتاب
          دسترسی دائمی داشته باشید.
        </p>
      </header>

      {packages === null ? (
        <SkeletonGrid count={3} />
      ) : !packages.length ? (
        <Empty icon="layers" title="پکیجی موجود نیست" description="به‌زودی پکیج‌های آموزشی اضافه می‌شوند." action="مشاهده‌ی آموزش‌ها" href="/learn" />
      ) : (
        <div className="stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <article key={pkg._id} className={`card-hover group relative flex flex-col overflow-hidden ${i === 0 ? 'ring-1 ring-firooze-500/25' : ''}`}>
              <div className="relative h-40 overflow-hidden bg-ink-800">
                {pkg.coverImage ? (
                  <img src={mediaUrl(pkg.coverImage)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <Shamse className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-firooze-400" size={200} opacity={0.12} />
                    <div className="grid h-full place-items-center text-firooze-500/40"><Icon name="layers" size={40} /></div>
                  </>
                )}
                <div className="absolute inset-0 bg-grad-fade" />
                {i === 0 && <span className="badge-paid absolute right-3 top-3"><Icon name="sparkle" size={11} /> پیشنهاد ما</span>}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 text-lg">{pkg.title}</h3>
                <p className="mb-5 text-[13px] leading-7 text-ink-400">{pkg.description}</p>

                <ul className="mb-6 space-y-2">
                  {PERKS.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-[12px] leading-6 text-ink-300">
                      <Icon name="check" size={14} className="mt-1 shrink-0 text-firooze-400" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <p className="num mb-3 text-2xl font-bold text-firooze-300">{toman(pkg.price)}</p>
                  <button onClick={() => add({ kind: 'package', id: pkg._id })} className="btn-primary w-full">
                    <Icon name="cart" size={17} /> افزودن به سبد
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-[12px] text-ink-500">
        سؤالی دارید؟ <Link href="/learn" className="link">اول آموزش‌های رایگان را ببینید</Link>
      </p>
    </div>
  );
}

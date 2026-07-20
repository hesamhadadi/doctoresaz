'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import Icon from './ui/Icon';
import { Shamse } from './ui/Shamse';

const STATIC_COLS = [
  {
    title: 'آموزش',
    links: [
      { to: '/learn', label: 'همه‌ی سازها' },
      { to: '/packages', label: 'پکیج‌های آموزشی' },
      { to: '/account/courses', label: 'دوره‌های من' },
    ],
  },
  {
    title: 'حساب کاربری',
    links: [
      { to: '/account', label: 'داشبورد' },
      { to: '/account/orders', label: 'پیگیری سفارش' },
      { to: '/account/wishlist', label: 'علاقه‌مندی‌ها' },
      { to: '/account/addresses', label: 'آدرس‌ها' },
    ],
  },
];

const TRUST = [
  { icon: 'truck', title: 'ارسال سراسری', desc: 'بالای ۱۵ میلیون رایگان' },
  { icon: 'shield', title: 'ضمانت اصالت', desc: 'مستقیم از کارگاه' },
  { icon: 'refresh', title: '۷ روز مهلت', desc: 'بازگشت بدون قید و شرط' },
  { icon: 'headphones', title: 'مشاوره‌ی تخصصی', desc: 'قبل و بعد از خرید' },
];

export default function Footer() {
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    apiGet('/categories?tree=1').then((data) => setCats(data)).catch(() => {});
  }, []);

  // ستون فروشگاه از روی دسته‌بندی‌های واقعی ساخته می‌شود تا لینک‌ها هرگز نشکنند.
  const COLS = [
    {
      title: 'فروشگاه',
      links: [
        ...cats.slice(0, 3).map((c) => ({ to: `/shop?category=${c.slug}`, label: c.name })),
        { to: '/shop?sort=cheap', label: 'ارزان‌ترین‌ها' },
      ],
    },
    ...STATIC_COLS,
  ];

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-ink-800 bg-ink-900/40">
      <Shamse className="pointer-events-none absolute -left-16 -top-16 text-firooze-500" size={280} opacity={0.045} />

      {/* نوار اعتماد */}
      <div className="border-b border-ink-800">
        <div className="container grid grid-cols-2 gap-x-4 gap-y-6 py-9 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-firooze-500/10 text-firooze-400 ring-1 ring-inset ring-firooze-500/20">
                <Icon name={t.icon} size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-100">{t.title}</p>
                <p className="truncate text-[11px] text-ink-400">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="mb-4 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-grad-firooze text-ink-950">
              <Icon name="music" size={20} />
            </span>
            <b className="font-display text-lg font-black text-ink-50">دکتر ساز</b>
          </Link>
          <p className="mb-5 max-w-sm text-[13px] leading-7 text-ink-400">
            فروشگاه سازهای دست‌ساز ایرانی و مدرسه‌ی آنلاین موسیقی. از انتخاب ساز تا نواختن اولین قطعه، کنار شماییم.
          </p>
          <div className="space-y-2 text-[13px] text-ink-400">
            <a href="tel:02100000000" className="flex items-center gap-2 transition-colors hover:text-firooze-300">
              <Icon name="phone" size={15} /> <span className="num">۰۲۱-۰۰۰۰۰۰۰۰</span>
            </a>
            <a href="mailto:info@doctoresaz.ir" className="flex items-center gap-2 transition-colors hover:text-firooze-300">
              <Icon name="mail" size={15} /> info@doctoresaz.ir
            </a>
            <p className="flex items-start gap-2">
              <Icon name="map" size={15} className="mt-0.5" /> تهران، خیابان ولیعصر
            </p>
          </div>
        </div>

        {COLS.map((c) => (
          <nav key={c.title}>
            <h4 className="mb-4 text-sm font-semibold text-ink-100">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link href={l.to} className="text-[13px] text-ink-400 transition-colors hover:text-firooze-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ink-800">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-right">
          <p className="text-[11px] text-ink-500">
            © {new Date().getFullYear().toLocaleString('fa-IR', { useGrouping: false })} دکتر ساز — تمامی حقوق محفوظ است.
          </p>
          <p className="text-[11px] text-ink-500">ساخته‌شده برای حامد حدادی</p>
        </div>
      </div>
    </footer>
  );
}

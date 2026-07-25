'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';

// اسلایدر بنر اصلی — تصویر پس‌زمینه‌ی تمام‌قاب + متن روی آن (الگوی دیجی‌کالا)
const SLIDES = [
  { img: '/banners/guitar.svg', tag: 'تازه رسید', title: 'گیتار الکتریک برندهای جهانی', desc: 'Fender · Cort · Squier · PRS · G&L', cta: 'مشاهده محصولات', href: '/shop?category=گیتار-الکتریک' },
  { img: '/banners/learn.svg', tag: 'مدرسه دکتر ساز', title: 'اول رایگان یاد بگیر، بعد بخر', desc: 'ویدیوی معرفی و نت هر قطعه رایگان است', cta: 'دوره‌های آموزشی', href: '/learn' },
  { img: '/banners/craft.svg', tag: 'دست‌ساز ایرانی', title: 'سازهایی که با دست ساخته می‌شوند', desc: 'مستقیم از کارگاه، با ضمانت اصالت کالا', cta: 'ورود به فروشگاه', href: '/shop' },
];

export default function PromoBanners() {
  const [i, setI] = useState(0);
  const timer = useRef<any>(null);
  const n = SLIDES.length;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(timer.current);
  }, [n]);

  const go = (idx: number) => { clearInterval(timer.current); setI((idx + n) % n); };

  return (
    <div className="container">
      <div className="group relative overflow-hidden rounded-xl bg-ink-900">
        {/* اسلایدها */}
        <div className="relative aspect-[1400/420] max-h-[380px] min-h-[190px] w-full">
          {SLIDES.map((s, idx) => (
            <Link key={idx} href={s.href} aria-hidden={idx !== i} tabIndex={idx === i ? 0 : -1}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
              {/* تصویر پس‌زمینه — همیشه درون قاب، بدون بیرون‌زدگی */}
              <img src={s.img} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
              {/* متن */}
              <div className="relative flex h-full items-center justify-end px-6 sm:px-12">
                <div className="max-w-[62%] text-right sm:max-w-md">
                  <span className="mb-2 inline-block rounded-md bg-white/20 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm sm:text-[11px]">{s.tag}</span>
                  <h2 className="mb-1.5 text-[16px] leading-[1.45] text-white sm:mb-2.5 sm:text-[27px]">{s.title}</h2>
                  <p className="mb-3 text-[11px] text-white/85 sm:mb-6 sm:text-[14px]">{s.desc}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12px] text-ink-50 sm:px-5 sm:py-2.5 sm:text-[13px]" style={{ fontWeight: 500 }}>
                    {s.cta}<Icon name="arrowLeft" size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* پیمایش */}
        <button onClick={() => go(i + 1)} aria-label="اسلاید قبلی"
          className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-100 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 sm:grid">
          <Icon name="chevronRight" size={18} />
        </button>
        <button onClick={() => go(i - 1)} aria-label="اسلاید بعدی"
          className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-100 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 sm:grid">
          <Icon name="chevronLeft" size={18} />
        </button>

        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, idx) => (
            <button key={idx} onClick={() => go(idx)} aria-label={`اسلاید ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

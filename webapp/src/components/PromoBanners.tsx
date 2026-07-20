'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Shamse } from '@/components/ui/Shamse';

// اسلایدر بنر تبلیغاتی بالای صفحه (الهام از سازکالا) — بنرهای گرادیانی on-brand
const SLIDES = [
  { eyebrow: 'تازه رسید', title: 'گیتار الکتریک برندهای جهانی', desc: 'Fender، Cort، Squier، PRS و G&L — با تضمین اصالت کالا', cta: 'خرید گیتار الکتریک', href: '/shop?category=گیتار-الکتریک', from: 'from-firooze-600/30', art: 'electric-guitar', accent: 'text-firooze-300' },
  { eyebrow: 'مدرسه‌ی دکتر ساز', title: 'اول رایگان یاد بگیر، بعد بخر', desc: 'ویدیو معرفی و نت هر قطعه رایگان است — سه‌تار، تار، دف و بیشتر', cta: 'دوره‌های آموزشی', href: '/learn', from: 'from-zaferan-600/30', art: 'setar', accent: 'text-zaferan-300' },
  { eyebrow: 'ارسال سراسری', title: 'خرید مطمئن سازهای دست‌ساز', desc: 'مستقیم از کارگاه‌های معتبر ایران، با ۷ روز مهلت بازگشت', cta: 'ورود به فروشگاه', href: '/shop', from: 'from-lajvard-500/30', art: 'tar', accent: 'text-firooze-300' },
];

export default function PromoBanners() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="container">
      <div className="relative overflow-hidden rounded-3xl border border-ink-750 bg-grad-ink">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(${i * 100}%)` }}>
          {SLIDES.map((s, idx) => (
            <div key={idx} className={`relative flex min-w-full items-center gap-6 overflow-hidden bg-gradient-to-l ${s.from} to-transparent px-6 py-10 sm:px-12 sm:py-14`}>
              <Shamse className="pointer-events-none absolute -left-16 -top-16 animate-spin-slow text-firooze-400" size={260} opacity={0.06} />
              <div className="relative z-10 max-w-lg">
                <span className={`eyebrow ${s.accent}`}>{s.eyebrow}</span>
                <h2 className="mb-3 text-2xl sm:text-3xl">{s.title}</h2>
                <p className="mb-6 text-[14px] leading-7 text-ink-300">{s.desc}</p>
                <Link href={s.href} className="btn-primary">{s.cta}<Icon name="arrowLeft" size={17} /></Link>
              </div>
              <img src={`/instruments/${s.art}.svg`} alt="" className="pointer-events-none absolute -left-6 bottom-0 hidden h-[115%] object-contain opacity-90 md:block" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`اسلاید ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-firooze-400' : 'w-1.5 bg-ink-600'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

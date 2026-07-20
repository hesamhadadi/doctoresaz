'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import Icon from '@/components/ui/Icon';
import { Shamse, Strings } from '@/components/ui/Shamse';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { SkeletonGrid } from '@/components/ui/Skeleton';

export default function Learn() {
  const [instruments, setInstruments] = useState<any>(null);

  useEffect(() => {
    apiGet('/instruments').then((data) => setInstruments(data)).catch(() => setInstruments([]));
  }, []);

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'آموزش' }]} />

      <header className="relative mb-10 max-w-2xl">
        <span className="eyebrow"><Strings count={4} className="text-firooze-400" /> مدرسه‌ی دکتر ساز</span>
        <h1 className="mb-4">آموزش سازهای ایرانی، قدم به قدم</h1>
        <p className="text-[15px] leading-8 text-ink-300">
          هر ساز شامل چند کتاب و هر کتاب شامل چند قطعه است. برای هر قطعه، ویدیوی معرفی و
          نت PDF <b className="text-firooze-300">رایگان</b> در دسترس است؛ ویدیوی کامل آموزش و
          فایل صوتی راهنما با خرید قطعه، کتاب یا پکیج باز می‌شود.
        </p>
      </header>

      {instruments === null ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {instruments.map((ins) => (
            <Link key={ins._id} href={`/saz/${ins.slug}`} className="card-hover group relative overflow-hidden">
              <div className="relative h-40 overflow-hidden bg-ink-800">
                {ins.coverImage ? (
                  <img src={mediaUrl(ins.coverImage)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <Shamse className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-firooze-400" size={200} opacity={0.12} />
                    <div className="grid h-full place-items-center text-firooze-500/40"><Icon name="music" size={44} /></div>
                  </>
                )}
                <div className="absolute inset-0 bg-grad-fade" />
              </div>

              <div className="p-5">
                <h3 className="mb-2 flex items-center gap-2 text-lg">
                  {ins.name}
                  <Icon name="arrowLeft" size={17} className="text-firooze-400 transition-transform group-hover:-translate-x-1.5" />
                </h3>
                <p className="clamp-3 text-[13px] leading-7 text-ink-400">{ins.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

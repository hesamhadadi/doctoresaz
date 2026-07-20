'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { num } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import Empty from '@/components/ui/Empty';
import { SkeletonLines } from '@/components/ui/Skeleton';

export default function MyCourses() {
  const [courses, setCourses] = useState<any>(null);

  useEffect(() => {
    apiGet('/users/me/dashboard').then((data) => setCourses(data.courses)).catch(() => setCourses([]));
  }, []);

  if (!courses) return <SkeletonLines count={4} />;

  return (
    <div>
      <header className="mb-7">
        <h1 className="mb-1.5 text-2xl">دوره‌های من</h1>
        <p className="text-sm text-ink-400">هر کتابی که خریده‌اید، همراه با میزان پیشرفتتان</p>
      </header>

      {!courses.length ? (
        <Empty icon="book" title="هنوز دوره‌ای ندارید" description="با خرید کتاب، قطعه یا پکیج، دسترسی دائمی به آموزش‌ها پیدا می‌کنید." action="مشاهده‌ی آموزش‌ها" href="/learn" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <Link key={c._id} href={`/book/${c._id}`} className="card-hover group overflow-hidden">
              <div className="relative h-36 overflow-hidden bg-ink-800">
                {c.coverImage ? (
                  <img src={mediaUrl(c.coverImage)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center text-ink-600"><Icon name="book" size={32} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                {c.percent === 100 && (
                  <span className="badge-free absolute right-3 top-3"><Icon name="check" size={12} /> تکمیل‌شده</span>
                )}
              </div>

              <div className="p-4">
                <p className="mb-1 text-[10px] tracking-wide text-firooze-400">{c.instrument?.name}</p>
                <h3 className="clamp-1 mb-3 text-[15px] font-semibold text-ink-50">{c.title}</h3>

                <div className="mb-2 h-2 overflow-hidden rounded-full bg-ink-800">
                  <div className="h-full rounded-full bg-grad-firooze transition-all duration-700" style={{ width: `${c.percent}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="num text-ink-400">{num(c.done)} از {num(c.total)} قطعه</span>
                  <span className="num font-semibold text-firooze-300">٪{num(c.percent)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

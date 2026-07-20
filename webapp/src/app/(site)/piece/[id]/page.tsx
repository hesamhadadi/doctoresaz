'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { SkeletonLines } from '@/components/ui/Skeleton';

const ASSETS = [
  { key: 'introVideo', label: 'ویدیو معرفی قطعه', icon: 'video', type: 'video' },
  { key: 'lessonVideo', label: 'ویدیو آموزش نواختن', icon: 'play', type: 'video' },
  { key: 'audioGuide', label: 'فایل صوتی راهنما', icon: 'headphones', type: 'audio' },
  { key: 'pdf', label: 'نت PDF', icon: 'file', type: 'file' },
];

export default function PiecePage() {
  const { id } = useParams();
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [p, setP] = useState<any>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    apiGet(`/pieces/${id}`).then((data) => setP(data)).catch(() => setP(false));
  }, [id]);

  if (p === null) return <div className="container py-10"><SkeletonLines count={5} /></div>;
  if (p === false) return <div className="container py-24 text-center"><h2>قطعه یافت نشد</h2></div>;

  const markDone = async () => {
    try {
      await apiPost('/users/me/progress', { pieceId: p._id, completed: !done });
      setDone(!done);
      toast.success(!done ? 'آفرین! این قطعه تکمیل شد' : 'علامت تکمیل برداشته شد');
    } catch { toast.error('خطایی رخ داد'); }
  };

  return (
    <div className="container py-8">
      <Breadcrumb
        items={[
          { to: '/learn', label: 'آموزش' },
          ...(p.book ? [{ to: `/book/${p.book._id || p.book}`, label: p.book.title || 'کتاب' }] : []),
          { label: p.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <header className="mb-7">
            <h1 className="mb-3">{p.title}</h1>
            {p.description && <p className="text-[15px] leading-8 text-ink-300">{p.description}</p>}
          </header>

          <div className="space-y-4">
            {ASSETS.map((a) => {
              const asset = p[a.key];
              if (!asset?.exists && !asset?.locked) return null;

              return (
                <section key={a.key} className="card overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-ink-800 px-4 py-3">
                    <Icon name={a.icon} size={17} className={asset.locked ? 'text-ink-500' : 'text-firooze-400'} />
                    <h3 className="flex-1 text-[14px] font-medium text-ink-50">{a.label}</h3>
                    <span className={asset.isFree ? 'badge-free' : asset.locked ? 'badge-neutral' : 'badge-paid'}>
                      {asset.isFree ? 'رایگان' : asset.locked ? 'قفل' : 'باز شده'}
                    </span>
                  </div>

                  {asset.locked ? (
                    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-800 text-ink-500">
                        <Icon name="lock" size={22} />
                      </span>
                      <p className="text-[13px] text-ink-400">برای دسترسی، این قطعه یا کتاب آن را تهیه کنید.</p>
                    </div>
                  ) : a.type === 'video' ? (
                    <video src={mediaUrl(asset.url)} controls playsInline className="aspect-video w-full bg-black" />
                  ) : a.type === 'audio' ? (
                    <div className="p-4"><audio src={mediaUrl(asset.url)} controls className="w-full" /></div>
                  ) : (
                    <div className="p-4">
                      <a href={mediaUrl(asset.url)} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                        <Icon name="download" size={15} /> دانلود نت PDF
                      </a>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {user && p.owned && (
            <button onClick={markDone} className={`mt-6 ${done ? 'btn-outline' : 'btn-primary'}`}>
              <Icon name={done ? 'refresh' : 'checkCircle'} size={17} />
              {done ? 'برداشتن علامت تکمیل' : 'این قطعه را یاد گرفتم'}
            </button>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {p.owned ? (
            <div className="panel p-5 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-firooze-500/12 text-firooze-300">
                <Icon name="checkCircle" size={24} />
              </span>
              <p className="mb-1 text-sm font-medium text-ink-50">دسترسی کامل دارید</p>
              <p className="text-[12px] text-ink-400">همه‌ی فایل‌های این قطعه برای شما باز است.</p>
            </div>
          ) : (
            <div className="panel space-y-4 p-5">
              <div>
                <p className="mb-1 text-xs text-ink-400">خرید همین قطعه</p>
                <p className="num text-2xl font-bold text-ink-50">{toman(p.price)}</p>
              </div>
              <button onClick={() => add({ kind: 'piece', id: p._id })} className="btn-primary w-full">
                <Icon name="cart" size={17} /> افزودن به سبد
              </button>

              {p.book && (
                <>
                  <div className="divider" />
                  <div className="rounded-xl bg-ink-850 p-3.5">
                    <p className="mb-2 text-[12px] leading-6 text-ink-300">
                      <Icon name="sparkle" size={13} className="ml-1 inline text-zaferan-400" />
                      خرید کل کتاب معمولاً به‌صرفه‌تر است.
                    </p>
                    <Link href={`/book/${p.book._id || p.book}`} className="btn-outline btn-sm w-full">
                      مشاهده‌ی کتاب
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

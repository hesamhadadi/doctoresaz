'use client';
import { useEffect, useState } from 'react';
import { mediaUrl } from '@/lib/client';
import Icon from './Icon';

// گالری محصول — تصویر مربعی روی زمینه‌ی سفید، با بندانگشتی و لایت‌باکس
export default function Gallery({ media = [] as any[], cover, fallback, title = '' }: any) {
  const items = (media?.length ? media : cover ? [{ url: cover, type: 'image' }] : []) as any[];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const current = items[active];
  const fb = fallback || '/instruments/setar.svg';

  // قفل اسکرول هنگام باز بودن لایت‌باکس + بستن با Esc
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [zoom]);

  if (!items.length) {
    return <div className="ratio-saz grid w-full place-items-center rounded-xl border border-ink-750 bg-white text-ink-500"><Icon name="image" size={40} /></div>;
  }

  const go = (d: number) => setActive((a) => (a + d + items.length) % items.length);
  const srcOf = (m: any, i: number) => (broken[i] ? mediaUrl(fb) : mediaUrl(m.type === 'video' ? m.poster || m.url : m.url));

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative overflow-hidden rounded-xl border border-ink-750 bg-white">
        {current.type === 'video' ? (
          <video key={current.url} src={mediaUrl(current.url)} poster={mediaUrl(current.poster)} controls playsInline
            className="ratio-saz w-full bg-black object-contain" />
        ) : (
          <>
            <img
              src={srcOf(current, active)} alt={current.alt || title} loading="eager"
              onClick={() => setZoom(true)}
              onError={() => setBroken((b) => ({ ...b, [active]: true }))}
              className="ratio-saz w-full cursor-zoom-in object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <button onClick={() => setZoom(true)} aria-label="بزرگ‌نمایی"
              className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-lg border border-ink-750 bg-ink-850/90 text-ink-200 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <Icon name="search" size={16} />
            </button>
          </>
        )}

        {items.length > 1 && (
          <>
            <button onClick={() => go(1)} aria-label="قبلی"
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-ink-750 bg-ink-850/90 text-ink-200 backdrop-blur transition-colors hover:text-firooze-600">
              <Icon name="chevronRight" size={17} />
            </button>
            <button onClick={() => go(-1)} aria-label="بعدی"
              className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-ink-750 bg-ink-850/90 text-ink-200 backdrop-blur transition-colors hover:text-firooze-600">
              <Icon name="chevronLeft" size={17} />
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="no-bar flex gap-2 overflow-x-auto pb-1">
          {items.map((m, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`تصویر ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white transition-all ${i === active ? 'border-firooze-500' : 'border-ink-750 opacity-70 hover:opacity-100'}`}>
              <img src={srcOf(m, i)} alt="" onError={() => setBroken((b) => ({ ...b, [i]: true }))} className="h-full w-full object-contain p-1.5" />
              {m.type === 'video' && (
                <span className="absolute inset-0 grid place-items-center bg-black/40 text-white"><Icon name="play" size={15} filled /></span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* لایت‌باکس */}
      {zoom && current.type !== 'video' && (
        <div className="fixed inset-0 z-[95] flex animate-fade-in items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={() => setZoom(false)}>
          <img src={srcOf(current, active)} alt={title} onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-lg bg-white object-contain p-4" />
          <button onClick={() => setZoom(false)} aria-label="بستن"
            className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-ink-50 transition-colors hover:bg-white">
            <Icon name="close" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { mediaUrl } from '@/lib/client';
import Icon from './Icon';

// گالری محصول: عکس + ویدیو، با بندانگشتی و بزرگ‌نمایی
export default function Gallery({ media = [], cover, title = '' }: any) {
  const items = media.length ? media : cover ? [{ url: cover, type: 'image' }] : [];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = items[active];

  if (!items.length) {
    return <div className="ratio-saz grid w-full place-items-center rounded-2xl bg-ink-850 text-ink-600"><Icon name="image" size={40} /></div>;
  }

  const go = (d) => setActive((a) => (a + d + items.length) % items.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative overflow-hidden rounded-2xl border border-ink-750 bg-ink-900">
        {current.type === 'video' ? (
          <video
            key={current.url}
            src={mediaUrl(current.url)}
            poster={mediaUrl(current.poster)}
            controls
            playsInline
            className="ratio-saz w-full bg-black object-contain"
          />
        ) : (
          <>
            <img
              src={mediaUrl(current.url)}
              alt={current.alt || title}
              loading="eager"
              onClick={() => setZoom(true)}
              onError={(e)=>{const t=e.currentTarget as HTMLImageElement; t.style.display="none";}}
              className="ratio-saz w-full cursor-zoom-in object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <button
              onClick={() => setZoom(true)}
              aria-label="بزرگ‌نمایی"
              className="glass absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-xl text-ink-100 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Icon name="search" size={17} />
            </button>
          </>
        )}

        {items.length > 1 && (
          <>
            <button onClick={() => go(1)} aria-label="قبلی" className="glass absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-ink-100 transition hover:text-firooze-300">
              <Icon name="chevronRight" size={18} />
            </button>
            <button onClick={() => go(-1)} aria-label="بعدی" className="glass absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-ink-100 transition hover:text-firooze-300">
              <Icon name="chevronLeft" size={18} />
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="no-bar flex gap-2.5 overflow-x-auto pb-1">
          {items.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`تصویر ${i + 1}`}
              className={`relative h-[72px] w-[62px] shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === active ? 'border-firooze-400 opacity-100' : 'border-ink-750 opacity-55 hover:opacity-90'
              }`}
            >
              <img src={mediaUrl(m.type === 'video' ? m.poster || m.url : m.url)} alt="" className="h-full w-full object-cover" />
              {m.type === 'video' && (
                <span className="absolute inset-0 grid place-items-center bg-black/45 text-white">
                  <Icon name="play" size={16} filled />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {zoom && current.type !== 'video' && (
        <div
          className="fixed inset-0 z-[95] grid animate-fade-in cursor-zoom-out place-items-center bg-black/92 p-4 backdrop-blur"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
        >
          <img src={mediaUrl(current.url)} alt={title} className="max-h-full max-w-full rounded-xl object-contain" />
          <button className="glass absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-xl text-white" aria-label="بستن">
            <Icon name="close" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

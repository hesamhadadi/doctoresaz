'use client';
import { mediaUrl } from '@/lib/client';

// Renders one of a piece's assets (video / pdf / audio) respecting its lock state.
export default function AssetCard({ icon, title, kind, asset }: any) {
  const free = asset?.isFree;
  const locked = asset?.locked;
  const url = asset?.url;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-750/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-ink-100">{title}</span>
        </div>
        {free ? (
          <span className="chip bg-emerald-500/15 text-emerald-300">رایگان</span>
        ) : locked ? (
          <span className="chip bg-zaferan-700/30 text-firooze-200">🔒 پولی</span>
        ) : (
          <span className="chip bg-firooze-400/15 text-firooze-400">✓ خریداری‌شده</span>
        )}
      </div>

      <div className="p-4">
        {locked ? (
          <div className="grid place-items-center gap-2 rounded-xl bg-ink-900 py-10 text-center">
            <span className="text-3xl">🔒</span>
            <p className="text-sm text-ink-400">برای دسترسی، این قطعه یا پکیج را تهیه کنید.</p>
          </div>
        ) : !url ? (
          <p className="py-8 text-center text-sm text-ink-400">هنوز فایلی آپلود نشده است.</p>
        ) : kind === 'video' ? (
          <video src={mediaUrl(url)} controls className="aspect-video w-full rounded-xl bg-black" />
        ) : kind === 'audio' ? (
          <audio src={mediaUrl(url)} controls className="w-full" />
        ) : (
          <a href={mediaUrl(url)} target="_blank" rel="noreferrer" className="btn-outline w-full">
            📄 دانلود / مشاهده فایل PDF
          </a>
        )}
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiGet, mediaUrl } from '@/lib/client';
import { toman } from '@/lib/format';
import Icon from '@/components/ui/Icon';

// جستجوی زنده با پیشنهاد آنی (debounce)
export default function SearchBox({ className = '', autoFocus = false, onDone }: any) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const box = useRef<any>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      apiGet(`/products?q=${encodeURIComponent(q.trim())}&limit=6`)
        .then((d) => { setItems(d.items || []); setOpen(true); })
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: any) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false); onDone?.();
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div ref={box} className={`relative ${className}`}>
      <form onSubmit={go}>
        <Icon name="search" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => items.length && setOpen(true)}
          autoFocus={autoFocus} placeholder="جستجوی ساز، گیتار، لوازم…" aria-label="جستجو"
          className="input py-2.5 pr-10 text-[13px]"
        />
        {loading && <span className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-ink-600 border-t-firooze-500" />}
      </form>

      {open && items.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 animate-scale-in overflow-hidden rounded-2xl border border-ink-750 bg-ink-850 shadow-lift">
          <ul className="max-h-[60vh] overflow-y-auto p-1.5">
            {items.map((p) => (
              <li key={p._id}>
                <Link href={`/product/${p.slug}`} onClick={() => { setOpen(false); onDone?.(); }}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ink-800">
                  <div className="h-12 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                    <img src={mediaUrl(p.coverImage)} alt="" className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = mediaUrl(p.fallbackImage || '/instruments/setar.svg'); }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-[13px] text-ink-50">{p.title}</p>
                    <p className="num text-[11px] text-firooze-600">{toman(p.price)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <button onClick={go as any} className="w-full border-t border-ink-800 py-2.5 text-center text-xs text-ink-300 transition-colors hover:bg-ink-800 hover:text-firooze-600">
            مشاهده‌ی همه‌ی نتایج
          </button>
        </div>
      )}
    </div>
  );
}

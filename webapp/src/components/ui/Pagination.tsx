'use client';
import Icon from './Icon';

export default function Pagination({ page, pages, onChange }: any) {
  if (pages <= 1) return null;
  const window: any[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) window.push(i);
    else if (window[window.length - 1] !== '…') window.push('…');
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="صفحه‌بندی">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="btn-outline btn-sm btn-icon" aria-label="قبلی">
        <Icon name="chevronRight" size={16} />
      </button>
      {window.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-1.5 text-ink-500">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`num h-9 min-w-9 rounded-lg px-2.5 text-sm transition-colors ${
              p === page
                ? 'bg-firooze-500 font-semibold text-ink-950'
                : 'border border-ink-700 text-ink-200 hover:border-firooze-500/50 hover:text-firooze-300'
            }`}
          >
            {p.toLocaleString('fa-IR')}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="btn-outline btn-sm btn-icon" aria-label="بعدی">
        <Icon name="chevronLeft" size={16} />
      </button>
    </nav>
  );
}

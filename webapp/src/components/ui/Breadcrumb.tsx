'use client';
import Link from 'next/link';
import Icon from './Icon';

export default function Breadcrumb({ items = [] as any[] }: any) {
  return (
    <nav aria-label="مسیر" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-ink-400">
      <Link href="/" className="transition-colors hover:text-firooze-300">خانه</Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          <Icon name="chevronLeft" size={13} className="text-ink-600" />
          {it.to && i < items.length - 1 ? (
            <Link href={it.to} className="transition-colors hover:text-firooze-300">{it.label}</Link>
          ) : (
            <span className="text-ink-200">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

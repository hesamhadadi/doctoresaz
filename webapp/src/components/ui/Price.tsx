'use client';
import { toman } from '@/lib/format';

// نمایش قیمت با قیمت قبل از تخفیف و درصد تخفیف
export default function Price({ value, compareAt = 0, size = 'md', className = '' }: any) {
  const has = compareAt > value;
  const pct = has ? Math.round(((compareAt - value) / compareAt) * 100) : 0;
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {has && (
        <span className="num badge bg-danger/15 text-red-300 ring-1 ring-inset ring-danger/25">
          ٪{pct.toLocaleString('fa-IR')}−
        </span>
      )}
      <span className={`num font-bold text-ink-50 ${sizes[size]}`}>{toman(value)}</span>
      {has && (
        <span className="num text-xs text-ink-500 line-through">{compareAt.toLocaleString('fa-IR')}</span>
      )}
    </div>
  );
}

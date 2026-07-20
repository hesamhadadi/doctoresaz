'use client';
import Icon from './Icon';
import { num } from '@/lib/format';

export default function Rating({ value = 0, count, size = 15, showCount = true, className = '' }: any) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={`${value} از ۵`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon
            key={i}
            name="star"
            size={size}
            filled={i <= Math.round(value)}
            className={i <= Math.round(value) ? 'text-zaferan-400' : 'text-ink-600'}
          />
        ))}
      </div>
      {showCount && count > 0 && <span className="num text-xs text-ink-400">({num(count)})</span>}
    </div>
  );
}

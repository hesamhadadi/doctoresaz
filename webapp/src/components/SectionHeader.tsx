'use client';
import Link from 'next/link';
import Icon from './ui/Icon';
import { Strings } from './ui/Shamse';

export default function SectionHeader({ eyebrow, title, description, href, linkLabel = 'مشاهده‌ی همه' }: any) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="eyebrow">
            <Strings count={4} className="text-firooze-400" />
            {eyebrow}
          </span>
        )}
        <h2>{title}</h2>
        {description && <p className="mt-3 text-[15px] leading-7 text-ink-300">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group flex items-center gap-1.5 whitespace-nowrap text-sm text-firooze-300 transition-colors hover:text-firooze-200">
          {linkLabel}
          <Icon name="arrowLeft" size={16} className="transition-transform group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}

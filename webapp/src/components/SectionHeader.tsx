'use client';
import Link from 'next/link';
import Icon from './ui/Icon';

// هدر بخش — ساده و تخت (الگوی دیجی‌کالا/علی‌بابا)
export default function SectionHeader({ eyebrow, title, description, href, linkLabel = 'مشاهده همه' }: any) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="max-w-2xl">
        <h2 className="text-[18px] sm:text-[22px]">{title}</h2>
        {description && <p className="mt-1.5 text-[13px] leading-6 text-ink-400">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-1 text-[13px] text-firooze-600 transition-colors hover:text-firooze-700">
          {linkLabel}
          <Icon name="arrowLeft" size={14} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

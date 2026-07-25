'use client';
import Link from 'next/link';
import Icon from './Icon';

export default function Empty({ icon = 'package', title, description, action, href }: any) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 px-6 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-ink-850 text-ink-500">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="mb-1.5 text-lg text-ink-100">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-ink-400">{description}</p>}
      {action && href && <Link href={href} className="btn-outline">{action}</Link>}
    </div>
  );
}

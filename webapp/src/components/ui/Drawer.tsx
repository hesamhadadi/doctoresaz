'use client';
import { useEffect } from 'react';
import Icon from './Icon';

// کشوی کناری (سبد خرید، فیلترها، منوی موبایل)
export default function Drawer({ open, onClose, title, side = 'left', children, footer, width = 'max-w-md' }: any) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`absolute inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'} flex w-full ${width} animate-slide-in-right flex-col border-ink-750 bg-ink-900 shadow-lift ${
          side === 'left' ? 'border-l' : 'border-r'
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
          <h3 className="text-base font-semibold text-ink-50">{title}</h3>
          <button onClick={onClose} aria-label="بستن" className="btn-ghost btn-icon btn-sm">
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-ink-800 bg-ink-850/60 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

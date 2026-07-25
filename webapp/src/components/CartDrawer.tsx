'use client';
import Link from 'next/link';
import { mediaUrl } from '@/lib/client';
import { toman, KIND_LABEL } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import Drawer from './ui/Drawer';
import Icon from './ui/Icon';
import QtyStepper from './ui/QtyStepper';
import Empty from './ui/Empty';

export default function CartDrawer() {
  const { cart, total, open, setOpen, setQty, remove, loading } = useCart();

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title={`سبد خرید${cart.count ? ` (${cart.count.toLocaleString('fa-IR')})` : ''}`}
      footer={
        cart.items.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-300">جمع کل</span>
              <span className="num text-lg font-bold text-ink-50">{toman(total)}</span>
            </div>
            {cart.hasPhysical && (
              <p className="flex items-center gap-1.5 text-xs text-ink-400">
                <Icon name="truck" size={14} /> هزینه ارسال در مرحله‌ی تسویه محاسبه می‌شود
              </p>
            )}
            <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary w-full">
              ادامه‌ی خرید و تسویه
              <Icon name="arrowLeft" size={17} />
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)} className="btn-ghost w-full text-xs">
              مشاهده‌ی کامل سبد
            </Link>
          </div>
        ) : null
      }
    >
      {!cart.items.length ? (
        <Empty icon="cart" title="سبد خرید خالی است" description="هنوز چیزی انتخاب نکرده‌اید." />
      ) : (
        <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-50' : ''}`}>
          {cart.items.map((it) => (
            <li key={it._id} className="flex gap-3 rounded-xl border border-ink-800 bg-ink-850/50 p-3">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                {it.image ? (
                  <img src={mediaUrl(it.image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-ink-600"><Icon name="music" size={20} /></div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="clamp-2 text-[13px] leading-5 text-ink-50">{it.title}</p>
                  <button onClick={() => remove(it._id)} aria-label="حذف" className="shrink-0 text-ink-500 transition-colors hover:text-danger">
                    <Icon name="trash" size={15} />
                  </button>
                </div>

                {it.variantName && <p className="mb-1 text-[11px] text-ink-400">{it.variantName}</p>}
                {it.kind !== 'product' && (
                  <span className="badge-free mb-1.5">{KIND_LABEL[it.kind]} آموزشی</span>
                )}

                <div className="mt-2 flex items-center justify-between gap-2">
                  {it.isPhysical ? (
                    <QtyStepper value={it.qty} onChange={(q) => setQty(it._id, q)} max={Math.max(it.stock || 1, 1)} />
                  ) : (
                    <span className="text-xs text-ink-400">دسترسی دائمی</span>
                  )}
                  <span className="num text-sm font-semibold text-firooze-300">{toman(it.lineTotal)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

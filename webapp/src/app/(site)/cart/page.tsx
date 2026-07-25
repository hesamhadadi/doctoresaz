'use client';
import Link from 'next/link';
import { useState } from 'react';
import { mediaUrl } from '@/lib/client';
import { toman, KIND_LABEL } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/Icon';
import QtyStepper from '@/components/ui/QtyStepper';
import Empty from '@/components/ui/Empty';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function CartPage() {
  const { cart, total, setQty, remove, clear, applyCoupon, loading } = useCart();
  const [code, setCode] = useState('');

  if (!cart.items.length) {
    return (
      <div className="container py-10">
        <Breadcrumb items={[{ label: 'سبد خرید' }]} />
        <Empty icon="cart" title="سبد خرید شما خالی است" description="سازها و لوازم جانبی را ببینید و انتخاب کنید." action="رفتن به فروشگاه" href="/shop" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'سبد خرید' }]} />
      <h1 className="mb-8">سبد خرید</h1>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className={`space-y-3 transition-opacity ${loading ? 'opacity-50' : ''}`}>
          {cart.items.map((it) => (
            <div key={it._id} className="card flex gap-4 p-4">
              <Link href={it.kind === 'product' ? `/product/${it.slug}` : '#'} className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-800">
                {it.image ? (
                  <img src={mediaUrl(it.image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-ink-600"><Icon name="music" size={24} /></div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="clamp-2 text-sm font-medium leading-6 text-ink-50">{it.title}</p>
                    {it.variantName && <p className="mt-1 text-[11px] text-ink-400">{it.variantName}</p>}
                    {it.kind !== 'product' && <span className="badge-free mt-1.5">{KIND_LABEL[it.kind]} آموزشی — دسترسی دائمی</span>}
                  </div>
                  <button onClick={() => remove(it._id)} aria-label="حذف" className="shrink-0 text-ink-500 transition-colors hover:text-danger">
                    <Icon name="trash" size={16} />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  {it.isPhysical ? (
                    <QtyStepper value={it.qty} onChange={(q) => setQty(it._id, q)} max={Math.max(it.stock || 1, 1)} />
                  ) : <span />}
                  <div className="text-left">
                    {it.qty > 1 && <p className="num text-[11px] text-ink-500">{toman(it.unitPrice)} × {it.qty.toLocaleString('fa-IR')}</p>}
                    <p className="num text-base font-bold text-ink-50">{toman(it.lineTotal)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={clear} className="btn-ghost btn-sm text-danger">
            <Icon name="trash" size={14} /> خالی‌کردن سبد
          </button>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-5">
            <h3 className="mb-4 text-base">خلاصه‌ی سفارش</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-300">جمع کالاها</span>
                <span className="num text-ink-100">{toman(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-firooze-300">
                  <span>تخفیف ({cart.couponCode})</span>
                  <span className="num">−{cart.discount.toLocaleString('fa-IR')}</span>
                </div>
              )}
              {cart.hasPhysical && (
                <div className="flex justify-between text-xs">
                  <span className="text-ink-400">هزینه ارسال</span>
                  <span className="text-ink-400">در مرحله‌ی بعد</span>
                </div>
              )}
            </div>

            <div className="divider my-4" />

            <div className="mb-5 flex items-baseline justify-between">
              <span className="text-sm text-ink-200">قابل پرداخت</span>
              <span className="num text-xl font-bold text-firooze-300">{toman(total)}</span>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); applyCoupon(code).catch(() => {}); }}
              className="mb-4 flex gap-2"
            >
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد تخفیف" className="input py-2.5 text-xs uppercase" />
              <button className="btn-outline btn-sm shrink-0">اعمال</button>
            </form>

            <Link href="/checkout" className="btn-primary w-full">
              ادامه و تسویه‌حساب <Icon name="arrowLeft" size={17} />
            </Link>

            <Link href="/shop" className="btn-ghost btn-sm mt-2 w-full text-xs">ادامه‌ی خرید</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

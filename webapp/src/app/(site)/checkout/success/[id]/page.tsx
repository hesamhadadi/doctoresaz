'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, faDateTime } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { ShamseDivider } from '@/components/ui/Shamse';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    apiGet(`/orders/mine/${id}`).then((data) => setOrder(data)).catch(() => {});
  }, [id]);

  return (
    <div className="container max-w-2xl py-16 text-center">
      <div className="mx-auto mb-6 grid h-20 w-20 animate-scale-in place-items-center rounded-3xl bg-firooze-500/12 text-firooze-300 ring-1 ring-firooze-500/25">
        <Icon name="checkCircle" size={38} />
      </div>

      <h1 className="mb-3">سفارش شما ثبت شد</h1>
      <p className="mb-8 text-sm leading-7 text-ink-300">
        از خرید شما سپاسگزاریم. جزئیات سفارش به‌زودی برایتان ارسال می‌شود.
      </p>

      {order && (
        <div className="panel mb-8 p-6 text-right">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-1 text-xs text-ink-400">شماره سفارش</p>
              <p className="num text-lg font-bold text-firooze-300">{order.orderNumber}</p>
            </div>
            <div className="text-left">
              <p className="mb-1 text-xs text-ink-400">تاریخ</p>
              <p className="text-[13px] text-ink-100">{faDateTime(order.createdAt)}</p>
            </div>
          </div>

          <ShamseDivider className="my-5" />

          <ul className="space-y-2.5">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="clamp-1 text-ink-200">{it.title}{it.qty > 1 && <span className="num text-ink-500"> ×{it.qty.toLocaleString('fa-IR')}</span>}</span>
                <span className="num shrink-0 text-ink-100">{toman(it.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="divider my-4" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-200">مبلغ پرداخت‌شده</span>
            <span className="num text-xl font-bold text-firooze-300">{toman(order.total)}</span>
          </div>

          {order.hasPhysical && (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-ink-850 p-3 text-[12px] text-ink-300">
              <Icon name="truck" size={15} className="text-firooze-400" />
              پس از آماده‌سازی، کد رهگیری مرسوله در بخش سفارش‌ها نمایش داده می‌شود.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/account/orders" className="btn-primary">پیگیری سفارش‌ها</Link>
        {order?.items.some((i) => i.kind !== 'product') && (
          <Link href="/account/courses" className="btn-outline">رفتن به دوره‌های من</Link>
        )}
        <Link href="/shop" className="btn-ghost">ادامه‌ی خرید</Link>
      </div>
    </div>
  );
}

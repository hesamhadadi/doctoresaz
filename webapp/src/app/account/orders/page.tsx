'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, faDate, num, ORDER_STATUS } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import Empty from '@/components/ui/Empty';
import { SkeletonLines } from '@/components/ui/Skeleton';

const TONE = {
  success: 'text-firooze-300 bg-firooze-500/12 ring-firooze-500/25',
  info: 'text-sky-300 bg-sky-500/12 ring-sky-500/25',
  warning: 'text-zaferan-300 bg-zaferan-400/12 ring-zaferan-400/25',
  danger: 'text-danger bg-danger/12 ring-danger/25',
};

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'pending', label: 'در انتظار پرداخت' },
  { key: 'processing', label: 'در حال آماده‌سازی' },
  { key: 'shipped', label: 'ارسال‌شده' },
  { key: 'delivered', label: 'تحویل‌شده' },
];

export default function MyOrders() {
  const [orders, setOrders] = useState<any>(null);
  const [f, setF] = useState('all');

  useEffect(() => {
    apiGet('/orders/mine').then((data) => setOrders(data)).catch(() => setOrders([]));
  }, []);

  if (!orders) return <SkeletonLines count={4} />;

  const list = f === 'all' ? orders : orders.filter((o) => o.status === f);

  return (
    <div>
      <header className="mb-6">
        <h1 className="mb-1.5 text-2xl">سفارش‌های من</h1>
        <p className="text-sm text-ink-400">پیگیری وضعیت و مشاهده‌ی فاکتور سفارش‌ها</p>
      </header>

      <div className="no-bar mb-6 flex gap-1.5 overflow-x-auto">
        {FILTERS.map((x) => (
          <button
            key={x.key}
            onClick={() => setF(x.key)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs transition-colors ${
              f === x.key ? 'bg-ink-800 font-medium text-firooze-300' : 'text-ink-400 hover:text-ink-100'
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {!list.length ? (
        <Empty icon="package" title="سفارشی در این وضعیت نیست" description="سفارش‌های شما اینجا نمایش داده می‌شوند." action="رفتن به فروشگاه" href="/shop" />
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
            return (
              <Link key={o._id} href={`/account/orders/${o._id}`} className="card-hover block p-4">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className={`badge ring-1 ring-inset ${TONE[st.tone]}`}>{st.label}</span>
                  <span className="num text-[13px] font-medium text-ink-50">{o.orderNumber}</span>
                  <span className="text-[11px] text-ink-500">{faDate(o.createdAt)}</span>
                  <span className="num mr-auto text-base font-bold text-ink-50">{toman(o.total)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 space-x-reverse">
                    {o.items.slice(0, 4).map((it, i) => (
                      <div key={i} className="h-10 w-9 overflow-hidden rounded-lg border-2 border-ink-850 bg-ink-800">
                        {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink-600"><Icon name="music" size={13} /></div>}
                      </div>
                    ))}
                  </div>
                  <span className="num text-[11px] text-ink-400">
                    {num(o.items.length)} قلم
                    {o.hasPhysical && o.trackingCode && ` · کد رهگیری ${o.trackingCode}`}
                  </span>
                  <Icon name="chevronLeft" size={16} className="mr-auto text-ink-500" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

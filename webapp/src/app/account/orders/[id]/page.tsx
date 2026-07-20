'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, faDateTime, num, ORDER_STATUS } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import { SkeletonLines } from '@/components/ui/Skeleton';

const TRACK = [
  { key: 'paid', label: 'پرداخت شد', icon: 'wallet' },
  { key: 'processing', label: 'آماده‌سازی', icon: 'package' },
  { key: 'shipped', label: 'ارسال شد', icon: 'truck' },
  { key: 'delivered', label: 'تحویل شد', icon: 'checkCircle' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [o, setO] = useState<any>(null);

  const load = () => apiGet(`/orders/mine/${id}`).then((data) => setO(data)).catch(() => setO(false));
  useEffect(() => { load(); }, [id]);

  if (o === null) return <SkeletonLines count={5} />;
  if (o === false) return <p className="py-16 text-center text-ink-400">سفارش یافت نشد.</p>;

  const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
  const cancelled = ['cancelled', 'refunded'].includes(o.status);

  const cancel = async () => {
    if (!confirm('از لغو این سفارش مطمئن هستید؟')) return;
    try {
      await apiPost(`/orders/mine/${id}/cancel`);
      toast.success('سفارش لغو شد');
      load();
    } catch (e: any) {
      toast.error((e as any).message || 'لغو ناموفق بود');
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-xs text-ink-400 transition-colors hover:text-firooze-300">
        <Icon name="chevronRight" size={14} /> بازگشت به سفارش‌ها
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="num mb-1.5 text-2xl">{o.orderNumber}</h1>
          <p className="text-sm text-ink-400">{faDateTime(o.createdAt)}</p>
        </div>
        <div className="text-left">
          <p className="mb-1 text-xs text-ink-400">مبلغ کل</p>
          <p className="num text-xl font-bold text-firooze-300">{toman(o.total)}</p>
        </div>
      </header>

      {/* نوار وضعیت */}
      {!cancelled ? (
        <div className="panel p-6">
          <div className="flex items-start justify-between">
            {TRACK.map((t, i) => {
              const done = st.step >= ORDER_STATUS[t.key].step;
              return (
                <div key={t.key} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div className="flex w-full items-center">
                    <span className={`h-0.5 flex-1 ${i === 0 ? 'bg-transparent' : done ? 'bg-firooze-500/60' : 'bg-ink-800'}`} />
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${done ? 'bg-firooze-500 text-ink-950' : 'bg-ink-800 text-ink-500'}`}>
                      <Icon name={t.icon} size={17} />
                    </span>
                    <span className={`h-0.5 flex-1 ${i === TRACK.length - 1 ? 'bg-transparent' : done && st.step > ORDER_STATUS[t.key].step ? 'bg-firooze-500/60' : 'bg-ink-800'}`} />
                  </div>
                  <span className={`text-[11px] ${done ? 'text-ink-100' : 'text-ink-500'}`}>{t.label}</span>
                </div>
              );
            })}
          </div>

          {o.trackingCode && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-ink-850 p-3 text-[13px]">
              <Icon name="truck" size={16} className="text-firooze-400" />
              کد رهگیری مرسوله: <span className="num font-semibold text-firooze-300">{o.trackingCode}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/25 bg-danger/[.07] p-5 text-danger">
          <Icon name="alert" size={20} />
          <span className="text-sm">این سفارش {st.label} است.</span>
        </div>
      )}

      {/* اقلام */}
      <section className="card p-5">
        <h3 className="mb-4 text-base">اقلام سفارش</h3>
        <ul className="space-y-3">
          {o.items.map((it, i) => (
            <li key={i} className="flex items-center gap-3.5 border-b border-ink-800 pb-3 last:border-0 last:pb-0">
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink-600"><Icon name="music" size={18} /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="clamp-1 text-[13px] text-ink-50">{it.title}</p>
                {it.variantName && <p className="text-[11px] text-ink-400">{it.variantName}</p>}
                <p className="num text-[11px] text-ink-500">{toman(it.unitPrice)} × {num(it.qty)}</p>
              </div>
              <span className="num shrink-0 text-sm font-semibold text-ink-100">{toman(it.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="divider my-4" />
        <dl className="space-y-2 text-[13px]">
          <div className="flex justify-between"><dt className="text-ink-400">جمع کالاها</dt><dd className="num text-ink-100">{toman(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between text-firooze-300"><dt>تخفیف {o.couponCode && `(${o.couponCode})`}</dt><dd className="num">−{o.discount.toLocaleString('fa-IR')}</dd></div>}
          {o.hasPhysical && <div className="flex justify-between"><dt className="text-ink-400">هزینه ارسال</dt><dd className="num text-ink-100">{o.shippingCost ? toman(o.shippingCost) : 'رایگان'}</dd></div>}
          <div className="flex justify-between border-t border-ink-800 pt-2 text-base"><dt className="text-ink-200">مبلغ نهایی</dt><dd className="num font-bold text-firooze-300">{toman(o.total)}</dd></div>
        </dl>
      </section>

      {/* آدرس */}
      {o.shippingAddress && (
        <section className="card p-5 text-[13px]">
          <h3 className="mb-3 flex items-center gap-2 text-base"><Icon name="map" size={17} className="text-firooze-400" /> آدرس تحویل</h3>
          <p className="mb-1 font-medium text-ink-50">{o.shippingAddress.fullName}</p>
          <p className="leading-7 text-ink-300">{o.shippingAddress.province}، {o.shippingAddress.city} — {o.shippingAddress.address}</p>
          <p className="num mt-1 text-ink-500">
            {o.shippingAddress.phone}
            {o.shippingAddress.postalCode && ` · کدپستی ${o.shippingAddress.postalCode}`}
          </p>
          {o.shippingAddress.note && <p className="mt-2 rounded-lg bg-ink-850 p-2.5 text-[12px] text-ink-300">یادداشت: {o.shippingAddress.note}</p>}
        </section>
      )}

      {/* تاریخچه */}
      {o.statusHistory?.length > 0 && (
        <section className="card p-5">
          <h3 className="mb-4 text-base">تاریخچه‌ی سفارش</h3>
          <ol className="space-y-3.5 border-r border-ink-800 pr-4">
            {[...o.statusHistory].reverse().map((h, i) => (
              <li key={i} className="relative text-[13px]">
                <span className="absolute -right-[22px] top-1.5 h-2 w-2 rounded-full bg-firooze-500 ring-4 ring-ink-950" />
                <p className="text-ink-100">{ORDER_STATUS[h.status]?.label || h.status}</p>
                {h.note && <p className="text-[11px] text-ink-400">{h.note}</p>}
                <p className="text-[11px] text-ink-500">{faDateTime(h.at)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {o.status === 'pending' && (
          <button onClick={() => apiPost(`/orders/${id}/pay`).then(load)} className="btn-primary">
            <Icon name="wallet" size={17} /> پرداخت سفارش
          </button>
        )}
        {['pending', 'paid', 'processing'].includes(o.status) && (
          <button onClick={cancel} className="btn-danger btn-sm">لغو سفارش</button>
        )}
        {o.items.some((i) => i.kind !== 'product') && ['paid', 'processing', 'shipped', 'delivered'].includes(o.status) && (
          <Link href="/account/courses" className="btn-outline btn-sm">رفتن به دوره‌های من</Link>
        )}
      </div>
    </div>
  );
}

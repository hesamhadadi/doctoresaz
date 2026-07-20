'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, faDateTime, num, ORDER_STATUS } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import Drawer from '@/components/ui/Drawer';
import { SkeletonLines } from '@/components/ui/Skeleton';

const TONE = {
  success: 'text-firooze-300 bg-firooze-500/12 ring-firooze-500/25',
  info: 'text-sky-300 bg-sky-500/12 ring-sky-500/25',
  warning: 'text-zaferan-300 bg-zaferan-400/12 ring-zaferan-400/25',
  danger: 'text-danger bg-danger/12 ring-danger/25',
};

const FILTERS = ['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function ManageOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState<any>(null);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<any>(null);
  const [form, setForm] = useState({ status: '', note: '', trackingCode: '' });

  const load = () =>
    apiGet(`/orders?status=${status}&q=${encodeURIComponent(q)}`)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]));

  useEffect(() => { load(); }, [status]);

  const openOrder = (o) => {
    setSel(o);
    setForm({ status: o.status, note: '', trackingCode: o.trackingCode || '' });
  };

  const save = async () => {
    try {
      await apiPut(`/orders/${sel._id}/status`, form);
      toast.success('وضعیت سفارش به‌روزرسانی شد');
      setSel(null);
      load();
    } catch (e: any) {
      toast.error((e as any).message || 'به‌روزرسانی ناموفق بود');
    }
  };

  if (orders === null) return <SkeletonLines count={6} />;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-2xl">سفارش‌ها</h1>
          <p className="num text-sm text-ink-400">{num(orders.length)} سفارش</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative w-full max-w-xs">
          <Icon name="search" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="شماره سفارش، نام، تلفن…" className="input pr-10 py-2.5 text-[13px]" />
        </form>
      </header>

      <div className="no-bar flex gap-1.5 overflow-x-auto">
        {FILTERS.map((k) => (
          <button
            key={k}
            onClick={() => setStatus(k)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs transition-colors ${
              status === k ? 'bg-ink-800 font-medium text-firooze-300' : 'text-ink-400 hover:text-ink-100'
            }`}
          >
            {k === 'all' ? 'همه' : ORDER_STATUS[k]?.label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>شماره</th><th>مشتری</th><th>اقلام</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
              return (
                <tr key={o._id} className="cursor-pointer" onClick={() => openOrder(o)}>
                  <td className="num text-[13px] font-medium">{o.orderNumber}</td>
                  <td>
                    <p className="text-[13px]">{o.user?.name || '—'}</p>
                    <p className="text-[11px] text-ink-500">{o.user?.email}</p>
                  </td>
                  <td className="num text-[13px]">
                    {num(o.items.length)} قلم
                    {o.hasPhysical && <Icon name="truck" size={13} className="mr-1.5 inline text-ink-500" />}
                  </td>
                  <td className="num text-[13px] font-semibold">{toman(o.total)}</td>
                  <td><span className={`badge ring-1 ring-inset ${TONE[st.tone]}`}>{st.label}</span></td>
                  <td className="text-[12px] text-ink-400">{faDateTime(o.createdAt)}</td>
                  <td><Icon name="chevronLeft" size={16} className="text-ink-500" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!orders.length && <p className="py-12 text-center text-sm text-ink-500">سفارشی یافت نشد.</p>}
      </div>

      {/* جزئیات و تغییر وضعیت */}
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `سفارش ${sel.orderNumber}` : ''} width="max-w-lg"
        footer={sel && <button onClick={save} className="btn-primary w-full">ذخیره‌ی تغییرات</button>}
      >
        {sel && (
          <div className="space-y-5">
            <div className="card p-4 text-[13px]">
              <p className="mb-1 font-medium text-ink-50">{sel.user?.name}</p>
              <p className="text-ink-400">{sel.user?.email}</p>
              {sel.user?.phone && <p className="num text-ink-400">{sel.user.phone}</p>}
            </div>

            <div>
              <h4 className="mb-2.5 text-sm font-semibold text-ink-100">اقلام</h4>
              <ul className="space-y-2">
                {sel.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl border border-ink-800 p-2.5">
                    <div className="h-12 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                      {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1 text-[12px]">
                      <p className="clamp-1 text-ink-100">{it.title}</p>
                      {it.variantName && <p className="text-[11px] text-ink-400">{it.variantName}</p>}
                      <p className="num text-[11px] text-ink-500">×{num(it.qty)}</p>
                    </div>
                    <span className="num text-[12px] text-ink-200">{toman(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1.5 text-[13px]">
                <div className="flex justify-between"><span className="text-ink-400">جمع</span><span className="num">{toman(sel.subtotal)}</span></div>
                {sel.discount > 0 && <div className="flex justify-between text-firooze-300"><span>تخفیف</span><span className="num">−{sel.discount.toLocaleString('fa-IR')}</span></div>}
                {sel.hasPhysical && <div className="flex justify-between"><span className="text-ink-400">ارسال</span><span className="num">{sel.shippingCost ? toman(sel.shippingCost) : 'رایگان'}</span></div>}
                <div className="flex justify-between border-t border-ink-800 pt-1.5 font-bold"><span>کل</span><span className="num text-firooze-300">{toman(sel.total)}</span></div>
              </div>
            </div>

            {sel.shippingAddress && (
              <div className="card p-4 text-[13px]">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-100">
                  <Icon name="map" size={15} className="text-firooze-400" /> آدرس ارسال
                </h4>
                <p className="text-ink-100">{sel.shippingAddress.fullName}</p>
                <p className="leading-6 text-ink-300">{sel.shippingAddress.province}، {sel.shippingAddress.city} — {sel.shippingAddress.address}</p>
                <p className="num text-ink-500">{sel.shippingAddress.phone} · {sel.shippingAddress.postalCode}</p>
                {sel.shippingAddress.note && <p className="mt-2 rounded-lg bg-ink-850 p-2 text-[12px]">یادداشت: {sel.shippingAddress.note}</p>}
              </div>
            )}

            <div className="divider" />

            <div className="space-y-4">
              <div>
                <label className="label">تغییر وضعیت</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select">
                  {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              {sel.hasPhysical && (
                <div>
                  <label className="label">کد رهگیری مرسوله</label>
                  <input value={form.trackingCode} onChange={(e) => setForm({ ...form, trackingCode: e.target.value })} className="input num" placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸" />
                </div>
              )}
              <div>
                <label className="label">یادداشت (در تاریخچه‌ی سفارش ثبت می‌شود)</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input" placeholder="اختیاری" />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, shortAmount, num, faDate, timeAgo, ORDER_STATUS } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { SkeletonLines } from '@/components/ui/Skeleton';

const TONE = {
  success: 'text-firooze-300 bg-firooze-500/12 ring-firooze-500/25',
  info: 'text-sky-300 bg-sky-500/12 ring-sky-500/25',
  warning: 'text-zaferan-300 bg-zaferan-400/12 ring-zaferan-400/25',
  danger: 'text-danger bg-danger/12 ring-danger/25',
};

// نمودار میله‌ای ساده و سبک — بدون کتابخانه‌ی خارجی
function BarChart({ data, valueKey = 'revenue' }: any) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex h-44 items-end gap-[3px]">
      {data.map((d, i) => {
        const h = (d[valueKey] / max) * 100;
        return (
          <div key={i} className="group relative flex-1">
            <div
              className="w-full rounded-t-sm bg-gradient-to-t from-firooze-700/40 to-firooze-400 transition-all duration-300 hover:from-firooze-600 hover:to-firooze-300"
              style={{ height: `${Math.max(h, 2)}%`, minHeight: 3 }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-[10px] shadow-lift group-hover:block">
              <p className="num text-firooze-300">{toman(d.revenue)}</p>
              <p className="num text-ink-400">{num(d.orders)} سفارش · {faDate(d.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// نمودار دایره‌ای (donut) با SVG
function Donut({ physical = 0, digital = 0 }: any) {
  const total = physical + digital || 1;
  const p = (physical / total) * 100;
  const C = 2 * Math.PI * 42;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#252C31" strokeWidth="12" />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke="#2FC2B4" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(p / 100) * C} ${C}`}
        />
      </svg>
      <ul className="space-y-2.5 text-[13px]">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-firooze-400" />
          <span className="text-ink-300">کالای فیزیکی</span>
          <span className="num mr-auto font-semibold text-ink-50">{shortAmount(physical)}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink-600" />
          <span className="text-ink-300">محتوای دیجیتال</span>
          <span className="num mr-auto font-semibold text-ink-50">{shortAmount(digital)}</span>
        </li>
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    apiGet('/stats/dashboard').then((data) => setD(data)).catch(() => setD(false));
  }, []);

  if (d === null) return <SkeletonLines count={6} />;
  if (d === false) return <p className="text-ink-400">خطا در دریافت آمار.</p>;

  const kpis = [
    { label: 'درآمد کل', value: toman(d.kpis.revenue), icon: 'wallet', accent: 'firooze' },
    { label: 'سفارش موفق', value: num(d.kpis.orders), icon: 'package', accent: 'firooze' },
    { label: 'در انتظار رسیدگی', value: num(d.kpis.pending), icon: 'clock', accent: 'zaferan', to: '/admin/orders' },
    { label: 'کاربران', value: num(d.kpis.users), icon: 'users', accent: 'zaferan', to: '/admin/users' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="mb-1.5 text-2xl">داشبورد</h1>
        <p className="text-sm text-ink-400">نمای کلی فروش، سفارش‌ها و محتوا</p>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((k) => {
          const Comp: any = k.to ? Link : 'div';
          return (
            <Comp key={k.label} href={k.to} className={`card p-4 ${k.to ? 'transition-colors hover:border-ink-600' : ''}`}>
              <div className="mb-3 flex items-start justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset ${
                  k.accent === 'firooze' ? 'bg-firooze-500/10 text-firooze-400 ring-firooze-500/20' : 'bg-zaferan-400/10 text-zaferan-400 ring-zaferan-400/20'
                }`}>
                  <Icon name={k.icon} size={18} />
                </span>
                {k.to && <Icon name="chevronLeft" size={15} className="text-ink-600" />}
              </div>
              <p className="num text-xl font-bold text-ink-50">{k.value}</p>
              <p className="mt-1 text-[11px] text-ink-400">{k.label}</p>
            </Comp>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* نمودار فروش */}
        <section className="card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base">فروش ۳۰ روز اخیر</h2>
            <span className="num text-xs text-ink-400">
              مجموع: {shortAmount(d.series.reduce((s, x) => s + x.revenue, 0))} تومان
            </span>
          </div>
          <BarChart data={d.series} />
          <div className="mt-3 flex justify-between text-[10px] text-ink-500">
            <span>{faDate(d.series[0]?.date)}</span>
            <span>{faDate(d.series[d.series.length - 1]?.date)}</span>
          </div>
        </section>

        {/* ترکیب فروش */}
        <section className="card p-5">
          <h2 className="mb-5 text-base">ترکیب درآمد</h2>
          <Donut physical={d.mix.physical || 0} digital={d.mix.digital || 0} />

          <div className="divider my-5" />
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { l: 'ساز', v: d.kpis.instruments },
              { l: 'کتاب', v: d.kpis.books },
              { l: 'قطعه', v: d.kpis.pieces },
            ].map((x) => (
              <div key={x.l}>
                <p className="num text-lg font-bold text-ink-50">{num(x.v)}</p>
                <p className="text-[10px] text-ink-400">{x.l}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* پرفروش‌ترین‌ها */}
        <section className="card p-5">
          <h2 className="mb-4 text-base">پرفروش‌ترین محصولات</h2>
          {!d.topProducts.length ? (
            <p className="py-6 text-center text-sm text-ink-500">هنوز فروشی ثبت نشده.</p>
          ) : (
            <ol className="space-y-3">
              {d.topProducts.map((p, i) => (
                <li key={p._id || i} className="flex items-center gap-3">
                  <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-800 text-[11px] font-bold text-ink-300">
                    {(i + 1).toLocaleString('fa-IR')}
                  </span>
                  <div className="h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                    {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-[13px] text-ink-100">{p.title}</p>
                    <p className="num text-[11px] text-ink-500">{num(p.qty)} فروش</p>
                  </div>
                  <span className="num shrink-0 text-[13px] font-semibold text-firooze-300">{shortAmount(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* موجودی رو به اتمام */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base">موجودی رو به اتمام</h2>
            <Link href="/admin/products" className="text-xs text-firooze-300">مدیریت</Link>
          </div>
          {!d.lowStock.length ? (
            <p className="py-6 text-center text-sm text-ink-500">موجودی همه‌ی محصولات مناسب است.</p>
          ) : (
            <ul className="space-y-3">
              {d.lowStock.map((p) => (
                <li key={p._id} className="flex items-center gap-3">
                  <div className="h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                    {p.coverImage && <img src={p.coverImage} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <p className="clamp-1 flex-1 text-[13px] text-ink-100">{p.title}</p>
                  <span className={`badge ${p.stock === 0 ? 'bg-danger/15 text-danger ring-1 ring-inset ring-danger/25' : 'bg-zaferan-400/12 text-zaferan-300 ring-1 ring-inset ring-zaferan-400/25'}`}>
                    {p.stock === 0 ? 'ناموجود' : `${num(p.stock)} عدد`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* آخرین سفارش‌ها */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base">آخرین سفارش‌ها</h2>
          <Link href="/admin/orders" className="text-xs text-firooze-300">همه‌ی سفارش‌ها</Link>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr><th>شماره</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th>زمان</th></tr>
            </thead>
            <tbody>
              {d.recentOrders.map((o) => {
                const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                return (
                  <tr key={o._id}>
                    <td className="num text-[13px]">{o.orderNumber}</td>
                    <td className="text-[13px]">{o.user?.name || '—'}</td>
                    <td className="num text-[13px]">{toman(o.total)}</td>
                    <td><span className={`badge ring-1 ring-inset ${TONE[st.tone]}`}>{st.label}</span></td>
                    <td className="text-[12px] text-ink-400">{timeAgo(o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

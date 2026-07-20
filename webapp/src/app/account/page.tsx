'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, num, faDate, ORDER_STATUS } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/Icon';
import Empty from '@/components/ui/Empty';
import { SkeletonLines } from '@/components/ui/Skeleton';

const TONE = {
  success: 'text-firooze-300 bg-firooze-500/12 ring-firooze-500/25',
  info: 'text-lajvard-500 bg-lajvard-500/12 ring-lajvard-500/25',
  warning: 'text-zaferan-300 bg-zaferan-400/12 ring-zaferan-400/25',
  danger: 'text-danger bg-danger/12 ring-danger/25',
};

export default function Overview() {
  const { user } = useAuth();
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    apiGet('/users/me/dashboard').then((data) => setD(data)).catch(() => setD({ stats: {}, courses: [], recentOrders: [] }));
  }, []);

  if (!d) return <SkeletonLines count={5} />;

  const cards = [
    { label: 'دوره‌های من', value: num(d.stats.courses), icon: 'book', tone: 'firooze' },
    { label: 'قطعات تکمیل‌شده', value: num(d.stats.completedPieces), icon: 'checkCircle', tone: 'firooze' },
    { label: 'سفارش‌ها', value: num(d.stats.orders), icon: 'package', tone: 'zaferan' },
    { label: 'مجموع خرید', value: toman(d.stats.totalSpent), icon: 'wallet', tone: 'zaferan', small: true },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="mb-1.5 text-2xl">سلام {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-ink-400">خلاصه‌ی فعالیت شما در دکتر ساز</p>
      </header>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <span
              className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset ${
                c.tone === 'firooze' ? 'bg-firooze-500/10 text-firooze-400 ring-firooze-500/20' : 'bg-zaferan-400/10 text-zaferan-400 ring-zaferan-400/20'
              }`}
            >
              <Icon name={c.icon} size={18} />
            </span>
            <p className={`num font-bold text-ink-50 ${c.small ? 'text-sm' : 'text-2xl'}`}>{c.value}</p>
            <p className="mt-1 text-[11px] text-ink-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ادامه‌ی یادگیری */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg">ادامه‌ی یادگیری</h2>
          <Link href="/account/courses" className="text-xs text-firooze-300 hover:text-firooze-200">همه‌ی دوره‌ها</Link>
        </div>

        {!d.courses.length ? (
          <Empty icon="book" title="هنوز دوره‌ای ندارید" description="با خرید یک کتاب یا پکیج، آموزش‌ها اینجا ظاهر می‌شوند." action="مشاهده‌ی آموزش‌ها" href="/learn" />
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {d.courses.slice(0, 4).map((c) => (
              <Link key={c._id} href={`/book/${c._id}`} className="card-hover flex gap-3.5 p-3.5">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                  {c.coverImage ? <img src={mediaUrl(c.coverImage)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink-600"><Icon name="book" size={20} /></div>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="clamp-1 text-[13px] font-medium text-ink-50">{c.title}</p>
                  <p className="mb-2 text-[11px] text-ink-400">{c.instrument?.name}</p>
                  <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div className="h-full rounded-full bg-grad-firooze transition-all duration-700" style={{ width: `${c.percent}%` }} />
                  </div>
                  <p className="num text-[10px] text-ink-500">{num(c.done)} از {num(c.total)} قطعه · ٪{num(c.percent)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* آخرین سفارش‌ها */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg">آخرین سفارش‌ها</h2>
          <Link href="/account/orders" className="text-xs text-firooze-300 hover:text-firooze-200">همه‌ی سفارش‌ها</Link>
        </div>

        {!d.recentOrders.length ? (
          <Empty icon="package" title="سفارشی ثبت نشده" description="اولین خریدتان را از فروشگاه شروع کنید." action="رفتن به فروشگاه" href="/shop" />
        ) : (
          <div className="space-y-2.5">
            {d.recentOrders.map((o) => {
              const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
              return (
                <Link key={o._id} href={`/account/orders/${o._id}`} className="card-hover flex flex-wrap items-center gap-3 p-4">
                  <span className={`badge ring-1 ring-inset ${TONE[st.tone]}`}>{st.label}</span>
                  <span className="num text-[13px] text-ink-100">{o.orderNumber}</span>
                  <span className="text-[11px] text-ink-500">{faDate(o.createdAt)}</span>
                  <span className="num mr-auto text-sm font-semibold text-ink-50">{toman(o.total)}</span>
                  <Icon name="chevronLeft" size={16} className="text-ink-500" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

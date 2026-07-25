'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, faDate, num } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import { SkeletonLines } from '@/components/ui/Skeleton';

const ROLES = { user: 'کاربر', instructor: 'مدرس', admin: 'مدیر' };

export default function ManageUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<any>(null);
  const [q, setQ] = useState('');

  const load = () => apiGet('/users').then((data) => setUsers(data)).catch(() => setUsers([]));
  useEffect(() => { load(); }, []);

  const setRole = async (u, role) => {
    try {
      await apiPut(`/users/${u._id}`, { role });
      toast.success('نقش کاربر تغییر کرد');
      load();
    } catch (e: any) { toast.error((e as any).message || 'خطا'); }
  };

  if (users === null) return <SkeletonLines count={6} />;

  const list = q
    ? users.filter((u) => u.name?.includes(q) || u.email?.includes(q) || u.phone?.includes(q))
    : users;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-2xl">کاربران</h1>
          <p className="num text-sm text-ink-400">{num(users.length)} کاربر ثبت‌نام‌شده</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Icon name="search" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="نام، ایمیل، تلفن…" className="input pr-10 py-2.5 text-[13px]" />
        </div>
      </header>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>کاربر</th><th>نقش</th><th>سفارش‌ها</th><th>مجموع خرید</th><th>عضویت</th></tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-firooze-500/12 text-xs font-bold text-firooze-300">
                      {u.name?.charAt(0) || '؟'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] text-ink-50">{u.name}</p>
                      <p className="truncate text-[11px] text-ink-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={u.role}
                    disabled={String(u._id) === String(me?._id)}
                    onChange={(e) => setRole(u, e.target.value)}
                    className="select w-32 py-2 text-xs disabled:opacity-50"
                  >
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="num text-[13px]">{num(u.orderCount)}</td>
                <td className="num text-[13px] font-semibold text-firooze-300">{toman(u.totalSpent)}</td>
                <td className="text-[12px] text-ink-400">{faDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="py-12 text-center text-sm text-ink-500">کاربری یافت نشد.</p>}
      </div>
    </div>
  );
}

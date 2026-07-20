'use client';
import { useRouter } from 'next/navigation';
import NavLink from '@/components/ui/NavLink';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/Icon';

const GROUPS = [
  {
    title: 'مرور',
    items: [{ to: '/admin', end: true, label: 'داشبورد', icon: 'chart' }],
  },
  {
    title: 'فروشگاه',
    items: [
      { to: '/admin/products', label: 'محصولات', icon: 'package' },
      { to: '/admin/categories', label: 'دسته‌بندی‌ها', icon: 'grid' },
      { to: '/admin/orders', label: 'سفارش‌ها', icon: 'truck' },
    ],
  },
  {
    title: 'آموزش',
    items: [
      { to: '/admin/instruments', label: 'سازها', icon: 'music' },
      { to: '/admin/books', label: 'کتاب‌ها', icon: 'book' },
      { to: '/admin/pieces', label: 'قطعات', icon: 'file' },
      { to: '/admin/packages', label: 'پکیج‌ها', icon: 'layers' },
    ],
  },
  {
    title: 'مدیریت',
    items: [{ to: '/admin/users', label: 'کاربران', icon: 'users' }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const cls = ({ isActive }: any) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] transition-all ${
      isActive
        ? 'bg-firooze-500/12 font-medium text-firooze-300 ring-1 ring-inset ring-firooze-500/20'
        : 'text-ink-300 hover:bg-ink-800 hover:text-ink-50'
    }`;

  const Nav = () => (
    <div className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-3.5 text-[10px] font-semibold uppercase tracking-[.15em] text-ink-500">{g.title}</p>
          <nav className="space-y-1">
            {g.items.map((m) => (
              <NavLink key={m.to} href={m.to} end={m.end} className={cls} onClick={() => setOpen(false)}>
                <Icon name={m.icon} size={17} />
                {m.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="flex">
        {/* نوار کناری دسکتاپ */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-ink-800 bg-ink-900/50 lg:flex">
          <div className="flex h-[68px] items-center gap-2.5 border-b border-ink-800 px-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-grad-zaferan text-ink-950">
              <Icon name="settings" size={18} />
            </span>
            <div className="leading-none">
              <b className="font-display text-[15px] font-black text-ink-50">پنل مدیریت</b>
              <p className="mt-1 text-[10px] text-ink-400">دکتر ساز</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <Nav />
          </div>

          <div className="border-t border-ink-800 p-3">
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50">
              <Icon name="external" size={16} /> مشاهده‌ی سایت
            </Link>
            <button onClick={() => { logout(); router.push('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] text-ink-400 transition-colors hover:bg-danger/10 hover:text-danger">
              <Icon name="logout" size={16} /> خروج
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* هدر */}
          <header className="sticky top-0 z-40 flex h-[68px] items-center gap-3 border-b border-ink-800 bg-ink-950/85 px-4 backdrop-blur-xl sm:px-6">
            <button onClick={() => setOpen(!open)} aria-label="منو" className="btn-ghost btn-icon lg:hidden">
              <Icon name={open ? 'close' : 'menu'} size={22} />
            </button>
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-grad-zaferan text-ink-950"><Icon name="settings" size={16} /></span>
            </Link>

            <div className="mr-auto flex items-center gap-3">
              <span className="hidden text-[13px] text-ink-300 sm:block">{user?.name}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-zaferan-400/15 text-xs font-bold text-zaferan-300">
                {user?.name?.charAt(0) || 'م'}
              </span>
            </div>
          </header>

          {/* منوی موبایل */}
          {open && (
            <div className="animate-fade-in border-b border-ink-800 bg-ink-900 p-4 lg:hidden">
              <Nav />
            </div>
          )}

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

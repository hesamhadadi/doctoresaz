'use client';
import { useRouter } from 'next/navigation';
import NavLink from '@/components/ui/NavLink';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/Icon';

const MENU = [
  { to: '/account', end: true, label: 'نمای کلی', icon: 'home' },
  { to: '/account/courses', label: 'دوره‌های من', icon: 'book' },
  { to: '/account/orders', label: 'سفارش‌ها', icon: 'package' },
  { to: '/account/wishlist', label: 'علاقه‌مندی‌ها', icon: 'heart' },
  { to: '/account/addresses', label: 'آدرس‌ها', icon: 'map' },
  { to: '/account/profile', label: 'پروفایل', icon: 'user' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const cls = ({ isActive }: any) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] transition-all ${
      isActive
        ? 'bg-firooze-500/12 font-medium text-firooze-300 ring-1 ring-inset ring-firooze-500/20'
        : 'text-ink-300 hover:bg-ink-800 hover:text-ink-50'
    }`;

  return (
    <div className="container py-8">
      <div className="grid gap-7 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel mb-4 p-5 text-center">
            <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-grad-firooze text-2xl font-black text-ink-950">
              {user?.name?.charAt(0) || '؟'}
            </span>
            <p className="truncate text-sm font-semibold text-ink-50">{user?.name}</p>
            <p className="truncate text-[11px] text-ink-400">{user?.email}</p>
          </div>

          <nav className="no-bar flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
            {MENU.map((m) => (
              <NavLink key={m.to} href={m.to} end={m.end} className={cls}>
                <Icon name={m.icon} size={17} />
                <span className="whitespace-nowrap">{m.label}</span>
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink href="/admin" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] text-zaferan-300 transition-colors hover:bg-ink-800">
                <Icon name="settings" size={17} />
                <span className="whitespace-nowrap">پنل مدیریت</span>
              </NavLink>
            )}

            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] text-ink-400 transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <Icon name="logout" size={17} />
              <span className="whitespace-nowrap">خروج</span>
            </button>
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

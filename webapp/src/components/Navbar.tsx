'use client';
import { useRouter, usePathname } from 'next/navigation';
import NavLink from '@/components/ui/NavLink';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Icon from './ui/Icon';
import ThemeToggle from './ThemeToggle';
import Drawer from './ui/Drawer';

const NAV = [
  { to: '/shop', label: 'فروشگاه', icon: 'package' },
  { to: '/learn', label: 'آموزش', icon: 'book' },
  { to: '/packages', label: 'پکیج‌ها', icon: 'layers' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);   // مگامنوی دسته‌بندی
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cats, setCats] = useState<any[]>([]);
  const menuRef = useRef<any>(null);
  const userRef = useRef<any>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    apiGet('/categories?tree=1').then((data) => setCats(data)).catch(() => {});
  }, []);

  useEffect(() => { setMobileOpen(false); setMenuOpen(false); setUserOpen(false); }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const linkCls = ({ isActive }: any) =>
    `relative px-3 py-2 text-sm transition-colors ${
      isActive ? 'text-firooze-300' : 'text-ink-200 hover:text-ink-50'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-ink-800 bg-ink-950/85 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="container flex h-[68px] items-center gap-3">
          {/* منوی موبایل */}
          <button onClick={() => setMobileOpen(true)} aria-label="منو" className="btn-ghost btn-icon lg:hidden">
            <Icon name="menu" size={22} />
          </button>

          {/* لوگو */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="دکتر ساز">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-grad-firooze text-ink-950 shadow-glow transition-transform duration-300 group-hover:rotate-[-8deg]">
              <Icon name="music" size={20} />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <b className="font-display text-[17px] font-black tracking-tight text-ink-50">دکتر ساز</b>
              <span className="mt-1 text-[10px] tracking-[.15em] text-ink-400">ساز و آموزش</span>
            </span>
          </Link>

          {/* ناوبری دسکتاپ */}
          <nav className="hidden items-center lg:flex">
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-ink-200 transition-colors hover:text-ink-50"
              >
                <Icon name="grid" size={16} />
                دسته‌بندی‌ها
                <Icon name="chevronDown" size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && cats.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-[720px] animate-scale-in overflow-hidden rounded-2xl border border-ink-750 shadow-lift">
                  {/* بک‌گراند مگامنو: گرادیان شب + هاله‌ی فیروزه‌ای + شمسه */}
                  <div className="relative bg-grad-ink">
                    <div className="pointer-events-none absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'radial-gradient(ellipse 50% 60% at 85% 0%, rgba(23,164,151,.18), transparent 60%), radial-gradient(ellipse 40% 50% at 10% 100%, rgba(232,155,46,.12), transparent 60%)' }} />
                    <div className="relative flex gap-5 p-5">
                      {/* ستون تصویری */}
                      <Link href="/shop?featured=1" className="group relative hidden w-44 shrink-0 overflow-hidden rounded-xl border border-ink-750 md:block">
                        <img src="/instruments/setar.svg" alt="سازهای ویژه" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3.5">
                          <p className="mb-1 text-[13px] font-semibold text-ink-50">سازهای ویژه</p>
                          <p className="flex items-center gap-1 text-[11px] text-firooze-300">مشاهده <Icon name="arrowLeft" size={12} /></p>
                        </div>
                      </Link>
                      {/* دسته‌بندی‌ها */}
                      <div className="grid flex-1 grid-cols-3 gap-x-5 gap-y-4">
                        {cats.map((c: any) => (
                          <div key={c._id}>
                            <Link href={`/shop?category=${c.slug}`} className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-firooze-300 transition-colors hover:text-firooze-200">
                              <span className="grid h-7 w-7 place-items-center rounded-lg bg-firooze-500/12 ring-1 ring-inset ring-firooze-500/20"><Icon name={c.icon || 'package'} size={14} /></span>
                              {c.name}
                            </Link>
                            <ul className="space-y-1.5 pr-1">
                              {c.children?.map((k: any) => (
                                <li key={k._id}>
                                  <Link href={`/shop?category=${k.slug}`} className="flex items-center justify-between text-[13px] text-ink-300 transition-colors hover:text-firooze-300">
                                    {k.name}
                                    {k.productCount > 0 && <span className="num text-[10px] text-ink-500">{k.productCount.toLocaleString('fa-IR')}</span>}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href="/shop" className="relative flex items-center justify-center gap-1.5 border-t border-ink-800 bg-ink-950/40 py-3 text-xs text-ink-200 transition-colors hover:text-firooze-300">
                      مشاهده‌ی همه‌ی محصولات <Icon name="arrowLeft" size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {NAV.map((n) => (
              <NavLink key={n.to} href={n.to} className={linkCls}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* جستجو */}
          <form onSubmit={submitSearch} className="relative mr-auto hidden max-w-xs flex-1 md:block">
            <Icon name="search" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی ساز، لوازم، آموزش…"
              aria-label="جستجو"
              className="h-11 w-full rounded-xl border border-ink-750 bg-ink-900/70 pr-10 text-[13px] text-ink-50 placeholder:text-ink-500 transition-colors hover:border-ink-600 focus:border-firooze-500 focus:outline-none focus:ring-2 focus:ring-firooze-500/20"
            />
          </form>

          {/* اکشن‌ها */}
          <div className="mr-auto flex items-center gap-1 md:mr-0">
            <button onClick={() => router.push('/shop')} aria-label="جستجو" className="btn-ghost btn-icon md:hidden">
              <Icon name="search" size={20} />
            </button>

            <Link href="/account/wishlist" aria-label="علاقه‌مندی‌ها" className="btn-ghost btn-icon relative hidden sm:inline-flex">
              <Icon name="heart" size={20} />
              {wishCount > 0 && (
                <span className="num absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                  {wishCount.toLocaleString('fa-IR')}
                </span>
              )}
            </Link>

            <ThemeToggle />
            <button onClick={() => setCartOpen(true)} aria-label="سبد خرید" className="btn-ghost btn-icon relative">
              <Icon name="cart" size={20} />
              {cart.count > 0 && (
                <span className="num absolute right-1 top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-firooze-500 px-1 text-[9px] font-bold text-ink-950">
                  {cart.count.toLocaleString('fa-IR')}
                </span>
              )}
            </button>

            {user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  aria-expanded={userOpen}
                  className="flex h-11 items-center gap-2 rounded-xl px-2 text-ink-200 transition-colors hover:bg-ink-800"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-firooze-500/15 text-xs font-bold text-firooze-300">
                    {user.name?.charAt(0) || '؟'}
                  </span>
                  <Icon name="chevronDown" size={13} className={`hidden transition-transform sm:block ${userOpen ? 'rotate-180' : ''}`} />
                </button>

                {userOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 animate-scale-in overflow-hidden rounded-2xl border border-ink-750 bg-ink-900/98 shadow-lift backdrop-blur-xl">
                    <div className="border-b border-ink-800 px-4 py-3">
                      <p className="truncate text-sm font-medium text-ink-50">{user.name}</p>
                      <p className="truncate text-[11px] text-ink-400">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { to: '/account', label: 'داشبورد من', icon: 'home' },
                        { to: '/account/courses', label: 'دوره‌های من', icon: 'book' },
                        { to: '/account/orders', label: 'سفارش‌ها', icon: 'package' },
                        { to: '/account/profile', label: 'پروفایل', icon: 'user' },
                      ].map((m) => (
                        <Link key={m.to} href={m.to} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50">
                          <Icon name={m.icon} size={16} className="text-ink-400" />
                          {m.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-zaferan-300 transition-colors hover:bg-ink-800">
                          <Icon name="settings" size={16} />
                          پنل مدیریت
                        </Link>
                      )}
                      <button onClick={() => { logout(); router.push('/'); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-ink-300 transition-colors hover:bg-danger/10 hover:text-danger">
                        <Icon name="logout" size={16} />
                        خروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-outline btn-sm mr-1 whitespace-nowrap">ورود</Link>
            )}
          </div>
        </div>
      </header>

      {/* منوی موبایل */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="منو" width="max-w-xs">
        <form onSubmit={submitSearch} className="relative mb-5">
          <Icon name="search" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو…" className="input pr-10" />
        </form>

        <nav className="space-y-1">
          {NAV.map((n) => (
            <NavLink key={n.to} href={n.to} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink-100 transition-colors hover:bg-ink-800">
              <Icon name={n.icon} size={18} className="text-firooze-400" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        {cats.length > 0 && (
          <>
            <div className="divider my-5" />
            <p className="mb-2.5 px-3 text-xs font-semibold text-ink-400">دسته‌بندی‌ها</p>
            <div className="space-y-4">
              {cats.map((c) => (
                <div key={c._id}>
                  <Link href={`/shop?category=${c.slug}`} className="mb-1.5 flex items-center gap-2 px-3 text-[13px] font-semibold text-firooze-300">
                    <Icon name={c.icon || 'package'} size={15} /> {c.name}
                  </Link>
                  <ul>
                    {c.children?.map((k) => (
                      <li key={k._id}>
                        <Link href={`/shop?category=${k.slug}`} className="block rounded-lg px-3 py-2 pr-8 text-[13px] text-ink-300 hover:bg-ink-800 hover:text-ink-50">
                          {k.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}

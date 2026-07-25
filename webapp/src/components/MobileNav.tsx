'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/Icon';

const ITEMS = [
  { href: '/', label: 'خانه', icon: 'home', exact: true },
  { href: '/shop', label: 'فروشگاه', icon: 'package' },
  { href: '/learn', label: 'آموزش', icon: 'book' },
  { href: '/cart', label: 'سبد', icon: 'cart', badge: true },
  { href: '/account', label: 'من', icon: 'user' },
];

// نوار پایین موبایل — حس اپلیکیشن بومی
export default function MobileNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="glass pb-safe fixed inset-x-0 bottom-0 z-[70] border-t lg:hidden" aria-label="ناوبری موبایل">
      <ul className="grid grid-cols-5">
        {ITEMS.map((it) => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link href={it.href} className={`press relative flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${active ? 'text-firooze-600' : 'text-ink-400'}`}>
                <span className="relative">
                  <Icon name={it.icon} size={21} filled={active} />
                  {it.badge && cart.count > 0 && (
                    <span className="num absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-firooze-500 px-1 text-[9px] font-bold text-white">
                      {cart.count.toLocaleString('fa-IR')}
                    </span>
                  )}
                </span>
                {it.label}
                {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-firooze-500" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

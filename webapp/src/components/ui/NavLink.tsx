'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type Props = {
  href: string;
  end?: boolean;
  className?: string | ((a: { isActive: boolean }) => string);
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>;

export default function NavLink({ href, end, className, children, ...rest }: Props) {
  const pathname = usePathname();
  const isActive = end ? pathname === href : pathname === href || pathname.startsWith(href + '/');
  const cls = typeof className === 'function' ? className({ isActive }) : className;
  return (
    <Link href={href} className={cls} aria-current={isActive ? 'page' : undefined} {...rest}>
      {children}
    </Link>
  );
}

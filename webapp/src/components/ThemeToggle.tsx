'use client';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  const toggle = () => {
    const d = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', d);
    try { localStorage.setItem('theme', d ? 'dark' : 'light'); } catch {}
    setDark(d);
  };
  return (
    <button onClick={toggle} aria-label="تغییر روشن/تیره" className="btn-ghost btn-icon">
      <Icon name={dark ? 'sun' : 'moon'} size={20} />
    </button>
  );
}

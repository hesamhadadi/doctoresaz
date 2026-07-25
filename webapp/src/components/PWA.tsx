'use client';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';

// ثبت سرویس‌ورکر و نمایش دکمه‌ی «نصب اپلیکیشن» وقتی مرورگر اجازه می‌دهد
export default function PWA() {
  const [deferred, setDeferred] = useState<any>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      try { if (!localStorage.getItem('pwa-dismissed')) setHidden(false); } catch { setHidden(false); }
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null); setHidden(true);
  };
  const dismiss = () => { setHidden(true); try { localStorage.setItem('pwa-dismissed', '1'); } catch {} };

  if (hidden || !deferred) return null;
  return (
    <div className="fixed inset-x-3 bottom-[76px] z-[80] animate-fade-up sm:inset-x-auto sm:left-5 sm:w-80 lg:bottom-5">
      <div className="glass flex items-center gap-3 rounded-2xl p-3.5 shadow-lift">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-firooze-500 text-white">
          <Icon name="music" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink-50">نصب اپلیکیشن دکتر ساز</p>
          <p className="text-[11px] text-ink-400">دسترسی سریع، بدون مرورگر</p>
        </div>
        <button onClick={install} className="btn-primary btn-sm shrink-0">نصب</button>
        <button onClick={dismiss} aria-label="بستن" className="btn-ghost btn-sm btn-icon shrink-0 text-ink-400">
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}

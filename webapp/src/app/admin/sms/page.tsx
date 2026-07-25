'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/client';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';

const TEMPLATES = [
  { label: 'اطلاع موجودی', text: 'دکتر ساز | محصول مورد نظر شما موجود شد. برای سفارش با ما تماس بگیرید.' },
  { label: 'پیگیری سفارش', text: 'دکتر ساز | سفارش شما آماده‌ی ارسال است. به‌زودی کد رهگیری برایتان ارسال می‌شود.' },
  { label: 'تخفیف ویژه', text: 'دکتر ساز | کد تخفیف NOWRUZ برای شما فعال شد — ۱۵٪ تخفیف روی همه‌ی محصولات.' },
];

export default function ManageSms() {
  const toast = useToast();
  const [to, setTo] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { apiGet('/users').then(setUsers).catch(() => {}); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(to)) return toast.error('شماره موبایل معتبر نیست');
    if (!text.trim()) return toast.error('متن پیامک را بنویسید');
    setBusy(true);
    try { await apiPost('/admin/sms', { to, text }); toast.success('پیامک ارسال شد'); setText(''); }
    catch (e: any) { toast.error(e.message || 'ارسال ناموفق بود'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="mb-1.5 text-2xl">ارسال پیامک</h1>
        <p className="text-sm text-ink-400">ارسال پیام دلخواه به مشتریان</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={send} className="card p-5">
          <div className="field">
            <label className="label">شماره موبایل گیرنده</label>
            <input value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, '').slice(0, 11))}
              inputMode="tel" placeholder="09123456789" className="input num" dir="ltr" />
          </div>
          <div className="field">
            <label className="label">متن پیامک</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
              className="textarea" placeholder="متن پیام…" />
            <p className="hint num">{text.length.toLocaleString('fa-IR')} / ۵۰۰ کاراکتر · کلمه‌ی «لغو» خودکار افزوده می‌شود</p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button key={t.label} type="button" onClick={() => setText(t.text)} className="btn-outline btn-sm text-[11px]">{t.label}</button>
            ))}
          </div>
          <button disabled={busy} className="btn-primary">{busy ? 'در حال ارسال…' : <><Icon name="mail" size={17} /> ارسال پیامک</>}</button>
        </form>

        <aside className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-ink-100">انتخاب سریع مشتری</h3>
          <ul className="max-h-[420px] space-y-1 overflow-y-auto">
            {users.filter((u) => u.phone).map((u) => (
              <li key={u._id}>
                <button onClick={() => setTo(u.phone)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-right transition-colors hover:bg-ink-800">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-firooze-500/12 text-[11px] font-bold text-firooze-600">{u.name?.charAt(0) || '؟'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] text-ink-100">{u.name}</span>
                    <span className="num block text-[10px] text-ink-500">{u.phone}</span>
                  </span>
                </button>
              </li>
            ))}
            {!users.some((u) => u.phone) && <li className="py-6 text-center text-xs text-ink-500">مشتری با شماره موبایل ثبت نشده است.</li>}
          </ul>
        </aside>
      </div>
    </div>
  );
}

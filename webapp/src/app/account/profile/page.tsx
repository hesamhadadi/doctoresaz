'use client';
import { useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { faDate } from '@/lib/format';
import Icon from '@/components/ui/Icon';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPut('/users/me', f);
      toast.success('اطلاعات ذخیره شد');
    } catch { toast.error('ذخیره ناموفق بود'); }
    finally { setBusy(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error('تکرار رمز جدید مطابقت ندارد');
    try {
      await apiPut('/users/me/password', { current: pw.current, next: pw.next });
      toast.success('رمز عبور تغییر کرد');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error((err as any).message || 'تغییر رمز ناموفق بود');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="mb-1.5 text-2xl">پروفایل</h1>
        <p className="text-sm text-ink-400">اطلاعات حساب کاربری خود را مدیریت کنید</p>
      </header>

      <section className="card p-5">
        <h3 className="mb-5 flex items-center gap-2 text-base"><Icon name="user" size={17} className="text-firooze-400" /> اطلاعات شخصی</h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">نام و نام خانوادگی</label>
              <input value={f.name} onChange={set('name')} className="input" />
            </div>
            <div>
              <label className="label">شماره موبایل</label>
              <input value={f.phone} onChange={set('phone')} inputMode="tel" className="input num" placeholder="09xxxxxxxxx" />
            </div>
          </div>
          <div>
            <label className="label">ایمیل</label>
            <input value={user?.email || ''} disabled className="input cursor-not-allowed opacity-60" />
            <p className="hint">ایمیل قابل تغییر نیست.</p>
          </div>
          <div>
            <label className="label">درباره‌ی من</label>
            <textarea value={f.bio} onChange={set('bio')} className="textarea" placeholder="مثلاً: هنرجوی سه‌تار، دو سال سابقه" />
          </div>
          <button disabled={busy} className="btn-primary btn-sm">{busy ? 'در حال ذخیره…' : 'ذخیره‌ی تغییرات'}</button>
        </form>
      </section>

      <section className="card p-5">
        <h3 className="mb-5 flex items-center gap-2 text-base"><Icon name="lock" size={17} className="text-firooze-400" /> تغییر رمز عبور</h3>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="label">رمز عبور فعلی</label>
            <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="input" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">رمز جدید</label>
              <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="input" minLength={6} required />
            </div>
            <div>
              <label className="label">تکرار رمز جدید</label>
              <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="input" minLength={6} required />
            </div>
          </div>
          <button className="btn-outline btn-sm">تغییر رمز</button>
        </form>
      </section>

      <p className="text-center text-[11px] text-ink-500">
        عضو دکتر ساز از {faDate(user?.createdAt)}
      </p>
    </div>
  );
}

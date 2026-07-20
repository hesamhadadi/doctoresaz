'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import { Shamse, Strings } from '@/components/ui/Shamse';

export default function LoginPage() {
  const { requestOtp, verifyOtp } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    timer.current = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer.current);
  }, [seconds]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^09\d{9}$/.test(phone)) return toast.error('شماره موبایل معتبر نیست (مثل 09123456789)');
    setBusy(true);
    try { await requestOtp(phone); toast.success('کد تأیید پیامک شد'); setStep('code'); setSeconds(90); }
    catch (err: any) { toast.error(err.message || 'ارسال کد ناموفق بود'); }
    finally { setBusy(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { await verifyOtp(phone, code, name); toast.success('خوش آمدید!'); router.push('/account'); router.refresh(); }
    catch (err: any) { toast.error(err.message || 'کد نادرست است'); }
    finally { setBusy(false); }
  };

  return (
    <div className="container grid min-h-[calc(100vh-68px)] max-w-md place-items-center py-10">
      <div className="w-full">
        <div className="mb-8 text-center">
          <Strings count={5} className="mx-auto mb-4 text-firooze-400" />
          <h1 className="mb-2 text-2xl">ورود یا ثبت‌نام</h1>
          <p className="text-sm text-ink-400">با شماره موبایل، سریع و بدون رمز عبور</p>
        </div>
        <div className="panel relative overflow-hidden p-6">
          <Shamse className="pointer-events-none absolute -left-12 -top-12 text-firooze-400" size={180} opacity={0.05} />
          {step === 'phone' ? (
            <form onSubmit={sendCode}>
              <div className="field">
                <label className="label">شماره موبایل</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="tel" placeholder="09123456789" className="input num text-center tracking-widest" dir="ltr" autoFocus />
              </div>
              <button disabled={busy} className="btn-primary mt-2 w-full">{busy ? 'در حال ارسال…' : 'دریافت کد تأیید'}</button>
            </form>
          ) : (
            <form onSubmit={verify}>
              <button type="button" onClick={() => setStep('phone')} className="mb-4 flex items-center gap-1.5 text-xs text-ink-400 hover:text-firooze-300"><Icon name="chevronRight" size={14} /> تغییر شماره ({phone})</button>
              <div className="field">
                <label className="label">کد تأیید پیامک‌شده</label>
                <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" placeholder="- - - - -" className="input num text-center text-lg tracking-[0.5em]" dir="ltr" autoFocus />
              </div>
              <div className="field">
                <label className="label">نام (اختیاری — برای ثبت‌نام)</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام خانوادگی" className="input" />
              </div>
              <button disabled={busy} className="btn-primary mt-2 w-full">{busy ? 'در حال بررسی…' : 'ورود'}</button>
              <button type="button" disabled={seconds > 0} onClick={() => sendCode()} className="btn-ghost btn-sm mt-2 w-full text-xs disabled:opacity-50">
                {seconds > 0 ? `ارسال مجدد کد تا ${seconds.toLocaleString('fa-IR')} ثانیه‌ی دیگر` : 'ارسال مجدد کد'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

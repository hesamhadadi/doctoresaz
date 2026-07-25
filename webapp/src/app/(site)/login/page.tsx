'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import { Shamse } from '@/components/ui/Shamse';

export default function LoginPage() {
  const { requestOtp, verifyOtp } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isNew, setIsNew] = useState(false);   // فقط از کاربر جدید نام می‌خواهیم
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
    if (!/^09\d{9}$/.test(phone)) return toast.error('شماره موبایل معتبر نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹)');
    setBusy(true);
    try {
      const res: any = await requestOtp(phone);
      setIsNew(Boolean(res?.isNewUser));
      toast.success('کد تأیید پیامک شد');
      setStep('code'); setSeconds(90);
    } catch (err: any) { toast.error(err.message || 'ارسال کد ناموفق بود'); }
    finally { setBusy(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew && name.trim().length < 2) return toast.error('لطفاً نام خود را وارد کنید');
    setBusy(true);
    try {
      const user: any = await verifyOtp(phone, code, isNew ? name.trim() : undefined);
      toast.success(isNew ? 'ثبت‌نام شد. خوش آمدید!' : 'خوش آمدید!');
      // مدیر مستقیم به پنل مدیریت می‌رود
      router.push(user?.role === 'admin' ? '/admin' : '/account');
      router.refresh();
    } catch (err: any) { toast.error(err.message || 'کد نادرست است'); }
    finally { setBusy(false); }
  };

  return (
    <div className="container grid min-h-[calc(100vh-68px)] max-w-md place-items-center py-10">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl">{step === 'phone' ? 'ورود یا ثبت‌نام' : isNew ? 'تکمیل ثبت‌نام' : 'ورود به حساب'}</h1>
          <p className="text-sm text-ink-400">با شماره موبایل، سریع و بدون رمز عبور</p>
        </div>

        <div className="panel relative overflow-hidden p-6">
          <Shamse className="pointer-events-none absolute -left-12 -top-12 text-firooze-500" size={180} opacity={0.05} />

          {step === 'phone' ? (
            <form onSubmit={sendCode}>
              <div className="field">
                <label className="label">شماره موبایل</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  inputMode="tel" placeholder="09123456789" className="input num text-center tracking-widest" dir="ltr" autoFocus />
              </div>
              <button disabled={busy} className="btn-primary btn-lg mt-2 w-full">
                {busy ? 'در حال ارسال…' : 'دریافت کد تأیید'}
              </button>
            </form>
          ) : (
            <form onSubmit={verify}>
              <button type="button" onClick={() => { setStep('phone'); setCode(''); }}
                className="mb-4 flex items-center gap-1.5 text-xs text-ink-400 transition-colors hover:text-firooze-600">
                <Icon name="chevronRight" size={14} /> تغییر شماره (<span className="num">{phone}</span>)
              </button>

              <div className="field">
                <label className="label">کد تأیید پیامک‌شده</label>
                <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  inputMode="numeric" placeholder="- - - - -" className="input num text-center text-lg tracking-[0.5em]" dir="ltr" autoFocus />
              </div>

              {/* نام فقط برای کاربر جدید */}
              {isNew && (
                <div className="field animate-fade-up">
                  <label className="label">نام و نام خانوادگی</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="مثلاً: حامد حدادی" />
                  <p className="hint">اولین ورود شماست — برای تکمیل ثبت‌نام نامتان را وارد کنید.</p>
                </div>
              )}

              <button disabled={busy} className="btn-primary btn-lg mt-2 w-full">
                {busy ? 'در حال بررسی…' : isNew ? 'ثبت‌نام و ورود' : 'ورود'}
              </button>
              <button type="button" disabled={seconds > 0} onClick={() => sendCode()}
                className="btn-ghost btn-sm mt-2 w-full text-xs disabled:opacity-50">
                {seconds > 0 ? <>ارسال مجدد کد تا <span className="num">{seconds.toLocaleString('fa-IR')}</span> ثانیه</> : 'ارسال مجدد کد'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

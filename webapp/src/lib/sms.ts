// یکپارچه‌سازی با ملی‌پیامک (Melipayamak)
// طبق مقررات مخابرات، پیامکِ خطوط تبلیغاتی باید کلمه‌ی «لغو» در انتها داشته باشد؛
// این متن به‌صورت خودکار به همه‌ی پیامک‌های متنی افزوده می‌شود.
const OTP_URL = process.env.SMS_OTP_URL;
const API_KEY = process.env.SMS_API_KEY;
const FROM = process.env.SMS_FROM;
export const ADMIN_PHONE = process.env.ADMIN_PHONE || '';
const CANCEL = process.env.SMS_CANCEL || 'لغو11';

const normalize = (p: string) => p.replace(/[^\d]/g, '').replace(/^98/, '0').replace(/^(?!0)/, '0').slice(0, 11);
const withCancel = (t: string) => (t.includes('لغو') ? t : `${t}\n${CANCEL}`);

// ارسال پیامک متنی ساده (اعلان‌ها و کد ورود). «لغو» خودکار افزوده می‌شود.
export async function sendSms(to: string, text: string): Promise<boolean> {
  if (!API_KEY || !FROM) { console.warn('[SMS] پیکربندی نشده (SMS_FROM/SMS_API_KEY):', normalize(to)); return false; }
  try {
    const res = await fetch(`https://console.melipayamak.com/api/send/simple/${API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: normalize(to), text: withCancel(text) }),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.recId) return true;
    console.warn('[SMS] پاسخ:', JSON.stringify(data).slice(0, 120));
    return false;
  } catch (e) { console.error('[SMS] خطا:', e); return false; }
}

// ارسال OTP:
//  - اگر خط فرستنده (SMS_FROM) تنظیم باشد → کد را خودمان می‌سازیم و با پیامک متنیِ دارای «لغو» می‌فرستیم
//    (برای همه‌ی شماره‌ها کار می‌کند و مشکل «عدم وجود لغو» را حل می‌کند).
//  - در غیر این صورت → از وب‌سرویس OTP ملی‌پیامک استفاده می‌شود.
export async function sendOtp(to: string): Promise<{ ok: boolean; code?: string; error?: string }> {
  if (API_KEY && FROM) {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const ok = await sendSms(to, `دکتر ساز\nکد ورود شما: ${code}`);
    return ok ? { ok: true, code } : { ok: false, error: 'ارسال پیامک ناموفق بود (خط فرستنده/اعتبار را بررسی کنید)' };
  }
  if (!OTP_URL) return { ok: false, error: 'پیکربندی پیامک انجام نشده' };
  try {
    const res = await fetch(OTP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: normalize(to) }) });
    const data = await res.json().catch(() => ({}));
    if (data?.code) return { ok: true, code: String(data.code) };
    return { ok: false, error: data?.status || 'ارسال پیامک ناموفق بود' };
  } catch (e: any) { return { ok: false, error: e?.message || 'خطای شبکه' }; }
}

export const smsTemplates = {
  orderPlacedToAdmin: (num: string, phone: string, total: string) =>
    `دکتر ساز | سفارش جدید ${num}\nمبلغ: ${total} تومان\nموبایل خریدار: ${phone}`,
  statusToUser: (num: string, status: string, tracking?: string) =>
    `دکتر ساز | وضعیت سفارش ${num}: ${status}` + (tracking ? `\nکد رهگیری: ${tracking}` : ''),
};

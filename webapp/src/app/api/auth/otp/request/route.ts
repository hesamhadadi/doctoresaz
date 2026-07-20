export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ok, fail, parseBody, clientIp } from '@/lib/api';
import { rateLimit } from '@/lib/ratelimit';
import { sendOtp } from '@/lib/sms';
import Otp from '@/models/Otp';

const schema = z.object({ phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست') });

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, schema);
  if (error) return error;
  const phone = data!.phone;

  // ریت‌لیمیت: هر شماره و هر IP محدود
  if (!rateLimit(`otp:${phone}`, 3, 5 * 60_000)) return fail('تعداد درخواست زیاد است. کمی بعد دوباره تلاش کنید.', 429);
  if (!rateLimit(`otp-ip:${clientIp(req)}`, 10, 5 * 60_000)) return fail('تعداد درخواست زیاد است.', 429);

  await connectDB();
  const res = await sendOtp(phone);
  if (!res.ok || !res.code) return fail(res.error || 'ارسال کد ناموفق بود', 502);

  const codeHash = await bcrypt.hash(res.code, 8);
  await Otp.findOneAndUpdate(
    { phone },
    { phone, codeHash, attempts: 0, expiresAt: new Date(Date.now() + 3 * 60_000) },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return ok({ ok: true, message: 'کد تأیید پیامک شد' });
}

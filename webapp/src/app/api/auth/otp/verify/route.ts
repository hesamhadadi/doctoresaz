export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ok, fail, parseBody } from '@/lib/api';
import { signSession, setAuthCookie } from '@/lib/auth';
import Otp from '@/models/Otp';
import User from '@/models/User';

const schema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  code: z.string().min(4).max(8),
  name: z.string().trim().min(2).max(60).optional(),
});

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, schema);
  if (error) return error;
  const { phone, code, name } = data!;

  await connectDB();
  const rec = await Otp.findOne({ phone });
  if (!rec) return fail('کد منقضی شده یا درخواست نشده است', 400);
  if (rec.attempts >= 5) { await rec.deleteOne(); return fail('تلاش‌های زیاد. دوباره کد بگیرید.', 429); }

  const match = await bcrypt.compare(code, rec.codeHash);
  if (!match) { rec.attempts++; await rec.save(); return fail('کد وارد‌شده نادرست است', 400); }
  await rec.deleteOne();

  // شماره‌های مدیر از env (با ویرگول جدا) — این شماره‌ها هنگام ورود نقش admin می‌گیرند
  const adminPhones = (process.env.ADMIN_PHONES || process.env.ADMIN_PHONE || '').split(',').map((x) => x.trim()).filter(Boolean);
  const shouldBeAdmin = adminPhones.includes(phone);

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, name: name?.trim() || `کاربر ${phone.slice(-4)}`, role: shouldBeAdmin ? 'admin' : 'user' });
  } else if (shouldBeAdmin && user.role !== 'admin') {
    user.role = 'admin';
  }
  user.lastLoginAt = new Date();
  await user.save();

  const token = await signSession({ id: String(user._id), role: user.role, name: user.name });
  await setAuthCookie(token);
  return ok({ user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
}

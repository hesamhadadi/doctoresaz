export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import User from '@/models/User';
export async function PUT(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const { current, next } = await req.json().catch(() => ({}));
  const user = await User.findById(session!.id).select('+password');
  if (user.password) { const okp = await user.matchPassword(current || ''); if (!okp) return fail('رمز عبور فعلی نادرست است'); }
  if ((next || '').length < 6) return fail('رمز جدید باید حداقل ۶ کاراکتر باشد');
  user.password = next; await user.save();
  return ok({ message: 'رمز عبور تغییر کرد' });
}

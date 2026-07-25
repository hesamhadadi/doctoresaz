export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, parseBody, requireRole } from '@/lib/api';
import { sendSms } from '@/lib/sms';

const schema = z.object({ to: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'), text: z.string().min(1).max(500) });
export async function POST(req: NextRequest) {
  const { error } = await requireRole('admin'); if (error) return error;
  const body = await parseBody(req, schema); if (body.error) return body.error;
  const sent = await sendSms(body.data!.to, body.data!.text);
  if (!sent) return fail('ارسال پیامک ناموفق بود (پیکربندی SMS_FROM/کلید را بررسی کنید)', 502);
  return ok({ ok: true, message: 'پیامک ارسال شد' });
}

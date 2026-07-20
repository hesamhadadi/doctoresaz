import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { getSession, Session, Role } from './auth';

// ابزارهای مشترک route handlerها: پاسخ استاندارد، اعتبارسنجی، گارد نقش‌ها

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) => NextResponse.json({ message }, { status });

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// اعتبارسنجی بدنه با zod (جلوی داده‌ی مخرب/NoSQL injection را می‌گیرد)
export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<{ data?: T; error?: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: fail('بدنه‌ی نامعتبر است') };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const msg = result.error.issues[0]?.message || 'داده‌ی نامعتبر';
    return { error: fail(msg, 422) };
  }
  return { data: result.data };
}

// نیازمند ورود
export async function requireAuth(): Promise<{ session?: Session; error?: NextResponse }> {
  const session = await getSession();
  if (!session) return { error: fail('ورود لازم است', 401) };
  return { session };
}

// نیازمند نقش خاص
export async function requireRole(...roles: Role[]): Promise<{ session?: Session; error?: NextResponse }> {
  const session = await getSession();
  if (!session) return { error: fail('ورود لازم است', 401) };
  if (!roles.includes(session.role)) return { error: fail('دسترسی غیرمجاز', 403) };
  return { session };
}

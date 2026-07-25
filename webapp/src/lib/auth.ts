import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// احراز هویت مبتنی بر کوکی httpOnly — امن‌تر از localStorage
// (در برابر XSS محافظت می‌شود چون جاوااسکریپت به کوکی دسترسی ندارد).

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'insecure-dev-secret-change-me');
export const COOKIE = 'ds_token';
export type Role = 'user' | 'instructor' | 'admin';
export interface Session { id: string; role: Role; name: string }

export async function signSession(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: String(payload.id), role: payload.role as Role, name: String(payload.name) };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

// خواندن نشست فعلی از کوکی (در route handlerها و server components)
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

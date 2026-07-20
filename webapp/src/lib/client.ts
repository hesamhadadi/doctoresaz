// کلاینت سمت مرورگر: fetch با کوکی (احراز هویت httpOnly)
// چون auth با کوکی است، نیازی به هدر Authorization نیست.
export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: 'include', cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'خطا');
  return data;
}
async function send<T = any>(method: string, path: string, body?: any): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method, credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'خطا');
  return data;
}
export const apiPost = <T = any>(p: string, b?: any) => send<T>('POST', p, b);
export const apiPut = <T = any>(p: string, b?: any) => send<T>('PUT', p, b);
export const apiDelete = <T = any>(p: string, b?: any) => send<T>('DELETE', p, b);

// آدرس رسانه: عکس واقعی (http)، وکتور محلی، یا آپلود
export const mediaUrl = (p?: string) => {
  if (!p) return '';
  return p;
};

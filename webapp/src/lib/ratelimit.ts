// ریت‌لیمیتر ساده‌ی درون‌حافظه‌ای (per-instance).
// جلوی حملات brute-force روی ورود/ثبت‌نام را می‌گیرد.
// برای مقیاس بالا در production می‌توان به Upstash Redis ارتقا داد.
type Bucket = { count: number; reset: number };
const store = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = store.get(key);
  if (!b || now > b.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

// پاک‌سازی دوره‌ای
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (now > v.reset) store.delete(k);
  }, 300_000).unref?.();
}

export const toman = (n?: number) => (!n || n <= 0 ? 'رایگان' : `${Number(n).toLocaleString('fa-IR')} تومان`);
export const num = (n?: number) => Number(n || 0).toLocaleString('fa-IR');
export const shortAmount = (n?: number) => {
  const v = Number(n || 0);
  if (v >= 1_000_000_000) return `${(v / 1e9).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} میلیارد`;
  if (v >= 1_000_000) return `${(v / 1e6).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} میلیون`;
  if (v >= 1_000) return `${(v / 1e3).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} هزار`;
  return v.toLocaleString('fa-IR');
};
export const faDate = (d?: string | Date) => (d ? new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
export const faDateTime = (d?: string | Date) => (d ? new Date(d).toLocaleString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
export const timeAgo = (d?: string | Date) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  const units: [number, string][] = [[31536000, 'سال'], [2592000, 'ماه'], [604800, 'هفته'], [86400, 'روز'], [3600, 'ساعت'], [60, 'دقیقه']];
  for (const [sec, label] of units) if (s >= sec) return `${Math.floor(s / sec).toLocaleString('fa-IR')} ${label} پیش`;
  return 'همین حالا';
};
export const ORDER_STATUS: Record<string, { label: string; tone: string; step: number }> = {
  pending: { label: 'در انتظار پرداخت', tone: 'warning', step: 0 },
  paid: { label: 'پرداخت‌شده', tone: 'info', step: 1 },
  processing: { label: 'در حال آماده‌سازی', tone: 'info', step: 2 },
  shipped: { label: 'ارسال‌شده', tone: 'info', step: 3 },
  delivered: { label: 'تحویل‌شده', tone: 'success', step: 4 },
  cancelled: { label: 'لغو شده', tone: 'danger', step: -1 },
  refunded: { label: 'مرجوع شده', tone: 'danger', step: -1 },
};
export const KIND_LABEL: Record<string, string> = { product: 'محصول', piece: 'قطعه', book: 'کتاب', package: 'پکیج' };

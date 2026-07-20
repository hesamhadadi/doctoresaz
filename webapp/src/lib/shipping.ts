export const SHIPPING_METHODS: Record<string, { key: string; label: string; base: number; perKg: number; days: string; note?: string }> = {
  post: { key: 'post', label: 'پست پیشتاز', base: 65000, perKg: 18000, days: '۳ تا ۵ روز کاری' },
  tipax: { key: 'tipax', label: 'تیپاکس (پس‌کرایه)', base: 0, perKg: 0, days: '۲ تا ۴ روز کاری', note: 'هزینه هنگام تحویل' },
  peyk: { key: 'peyk', label: 'پیک تهران', base: 120000, perKg: 0, days: 'همان روز' },
};
export const FREE_SHIPPING_THRESHOLD = 15_000_000;

export function calcShipping({ method = 'post', weightGrams = 0, subtotal = 0, hasPhysical }: { method?: string; weightGrams?: number; subtotal?: number; hasPhysical: boolean }): number {
  if (!hasPhysical) return 0;
  const m = SHIPPING_METHODS[method] || SHIPPING_METHODS.post;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  const kg = Math.max(1, Math.ceil(weightGrams / 1000));
  return m.base + m.perKg * (kg - 1);
}

// نگاشت دسته‌بندی به آرت‌ورک ساز (برای نمایش تصویر واقعی به‌جای آیکون یکسان)
const MAP: Record<string, string> = {
  'سه-تار': 'setar', 'سه‌تار': 'setar',
  'تار': 'tar', 'دف': 'daf', 'سنتور': 'santur',
  'هنگ-درام': 'handpan', 'هنگ‌درام': 'handpan', 'کمانچه': 'kamancheh',
  'گیتار': 'electric-guitar', 'گیتار-الکتریک': 'electric-guitar',
  'جعبه-و-کاور': 'case', 'سیم-و-مضراب': 'strings', 'کوک-و-متعلقات': 'tuner',
  'کتاب-آموزشی': 'book', 'کتاب-و-نت': 'book', 'لوازم-جانبی': 'strings', 'سازها': 'setar',
};
export const catImage = (slug?: string, image?: string) => {
  if (image) return image;
  const key = MAP[String(slug || '')];
  return key ? `/instruments/${key}.svg` : '';
};

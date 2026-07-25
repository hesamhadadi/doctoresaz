const PERSIAN = /[؀-ۿ]/;

export function makeSlug(text = ''): string {
  const raw = String(text).trim();
  if (!raw) return '';
  if (PERSIAN.test(raw)) {
    return raw
      .replace(/[‌‏‎]/g, '-')
      .replace(/[\s_/\\]+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function uniqueSlug(
  Model: any,
  text: string,
  excludeId: string | null = null
): Promise<string> {
  const base = makeSlug(text) || `item-${Date.now()}`;
  let slug = base;
  let i = 1;
  while (true) {
    const q: any = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    const found = (await Model.findOne(q).lean()) as any;
    if (!found) return slug;
    slug = `${base}-${++i}`;
  }
}
export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, requireRole } from '@/lib/api';
import { uniqueSlug } from '@/lib/slug';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  await connectDB();
  const cats = await Category.find({ isPublished: true }).sort({ order: 1, name: 1 }).lean<any>() as any[];
  const counts = await Product.aggregate([{ $match: { isPublished: true } }, { $group: { _id: '$category', n: { $sum: 1 } } }]);
  const cmap = Object.fromEntries(counts.map((c: any) => [String(c._id), c.n]));
  cats.forEach((c) => (c.productCount = cmap[String(c._id)] || 0));

  if (req.nextUrl.searchParams.get('tree') === '1') {
    const byId: any = Object.fromEntries(cats.map((c) => [String(c._id), { ...c, children: [] }]));
    const roots: any[] = [];
    for (const c of Object.values(byId) as any[]) {
      if (c.parent && byId[String(c.parent)]) byId[String(c.parent)].children.push(c);
      else roots.push(c);
    }
    roots.forEach((r) => (r.totalCount = r.productCount + r.children.reduce((s: number, c: any) => s + c.productCount, 0)));
    return ok(roots);
  }
  return ok(cats);
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const slug = await uniqueSlug(Category, body.slug || body.name);
  const cat = await Category.create({ ...body, slug, parent: body.parent || null });
  return ok(cat, 201);
}

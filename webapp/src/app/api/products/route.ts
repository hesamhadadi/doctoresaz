export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok } from '@/lib/api';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const { category, q, min, max, sort = 'newest', inStock, featured, instrument } = Object.fromEntries(sp);
  const page = Math.max(1, parseInt(sp.get('page') || '1'));
  const limit = Math.min(48, parseInt(sp.get('limit') || '12'));
  const filter: any = { isPublished: true };

  if (category) {
    const cat = await Category.findOne({ slug: category }).lean<any>() as any;
    if (cat) {
      const kids = await Category.find({ parent: cat._id }).select('_id').lean<any>();
      filter.category = { $in: [cat._id, ...kids.map((k: any) => k._id)] };
    } else return ok({ items: [], total: 0, page, pages: 0 });
  }
  if (instrument) filter.instrument = instrument;
  if (featured === '1') filter.isFeatured = true;
  if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { brand: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }];
  if (min || max) { filter.price = {}; if (min) filter.price.$gte = Number(min); if (max) filter.price.$lte = Number(max); }
  if (inStock === '1') filter.stock = { $gt: 0 };

  const sorts: any = { newest: { createdAt: -1 }, cheap: { price: 1 }, expensive: { price: -1 }, popular: { soldCount: -1 }, rating: { ratingAvg: -1 } };
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(limit).lean<any>({ virtuals: true }),
    Product.countDocuments(filter),
  ]);
  return ok({ items, total, page, pages: Math.ceil(total / limit) });
}

export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ok, fail, parseBody, requireAuth } from '@/lib/api';
import Product from '@/models/Product';
import Review from '@/models/Review';

const schema = z.object({ rating: z.number().min(1).max(5), comment: z.string().max(1000).optional() });

// پارامتر مسیر «slug» است ولی مقدارش می‌تواند _id هم باشد (فرانت با id صدا می‌زند)
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const body = await parseBody(req, schema);
  if (body.error) return body.error;
  await connectDB();
  const key = params.slug;
  const product = await Product.findOne(key.match(/^[0-9a-fA-F]{24}$/) ? { _id: key } : { slug: key });
  if (!product) return fail('محصول یافت نشد', 404);
  await Review.findOneAndUpdate(
    { product: product._id, user: session!.id },
    { rating: body.data!.rating, comment: body.data!.comment || '', isApproved: true },
    { upsert: true, setDefaultsOnInsert: true }
  );
  const stats = await Review.aggregate([{ $match: { product: product._id, isApproved: true } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  product.ratingAvg = Math.round((stats[0]?.avg || 0) * 10) / 10;
  product.ratingCount = stats[0]?.n || 0;
  await product.save();
  return ok({ ratingAvg: product.ratingAvg, ratingCount: product.ratingCount }, 201);
}

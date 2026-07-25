export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import Product from '@/models/Product';
import Review from '@/models/Review';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB();
  const product = await Product.findOne({ slug: params.slug }).populate('category', 'name slug parent').populate('instrument', 'name slug').lean<any>({ virtuals: true }) as any;
  if (!product) return fail('محصول یافت نشد', 404);
  Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});
  const [reviews, related] = await Promise.all([
    Review.find({ product: product._id, isApproved: true }).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(20).lean<any>(),
    Product.find({ category: product.category?._id, _id: { $ne: product._id }, isPublished: true }).limit(8).lean<any>({ virtuals: true }),
  ]);
  return ok({ ...product, reviews, related });
}

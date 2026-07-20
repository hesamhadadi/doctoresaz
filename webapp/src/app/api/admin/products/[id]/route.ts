export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireRole } from '@/lib/api';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { uniqueSlug } from '@/lib/slug';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const patch = await req.json().catch(() => ({}));
  if (patch.title || patch.slug) patch.slug = await uniqueSlug(Product, patch.slug || patch.title, params.id);
  const doc = await Product.findByIdAndUpdate(params.id, patch, { new: true });
  if (!doc) return fail('محصول یافت نشد', 404);
  return ok(doc);
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  await Product.findByIdAndDelete(params.id);
  await Review.deleteMany({ product: params.id });
  return ok({ message: 'حذف شد' });
}

export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireRole } from '@/lib/api';
import { uniqueSlug } from '@/lib/slug';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const patch = await req.json().catch(() => ({}));
  if (patch.name || patch.slug) patch.slug = await uniqueSlug(Category, patch.slug || patch.name, params.id);
  if ('parent' in patch) patch.parent = patch.parent || null;
  const cat = await Category.findByIdAndUpdate(params.id, patch, { new: true });
  if (!cat) return fail('یافت نشد', 404);
  return ok(cat);
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const used = await Product.countDocuments({ category: params.id });
  if (used) return fail(`این دسته ${used} محصول دارد و حذف نمی‌شود`);
  await Category.deleteMany({ $or: [{ _id: params.id }, { parent: params.id }] });
  return ok({ message: 'حذف شد' });
}

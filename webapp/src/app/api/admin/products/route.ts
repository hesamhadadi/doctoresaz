export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireRole } from '@/lib/api';
import Product from '@/models/Product';
import { uniqueSlug } from '@/lib/slug';

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.category) return fail('عنوان و دسته‌بندی الزامی است', 422);
  const slug = await uniqueSlug(Product, body.slug || body.title);
  const doc = await Product.create({ ...body, slug, instrument: body.instrument || null, createdBy: session!.id });
  return ok(doc, 201);
}

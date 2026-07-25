export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok, requireRole } from '@/lib/api';
import Product from '@/models/Product';
export async function GET() {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const items = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 }).lean<any>({ virtuals: true });
  return ok(items);
}

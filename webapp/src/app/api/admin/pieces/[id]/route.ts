export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireRole } from '@/lib/api';
import Piece from '@/models/Piece';
import { uniqueSlug } from '@/lib/slug';
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const patch = await req.json().catch(() => ({}));
  
  const doc = await Piece.findByIdAndUpdate(params.id, patch, { new: true });
  if (!doc) return fail('یافت نشد', 404);
  return ok(doc);
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  await Piece.findByIdAndDelete(params.id);
  return ok({ message: 'حذف شد' });
}

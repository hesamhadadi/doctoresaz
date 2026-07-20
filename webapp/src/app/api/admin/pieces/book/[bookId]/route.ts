export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, requireRole } from '@/lib/api';
import Piece from '@/models/Piece';
export async function GET(_req: NextRequest, { params }: { params: { bookId: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  return ok(await Piece.find({ book: params.bookId }).sort({ order: 1 }).lean<any>());
}

export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { getUserEntitlements, applyAccessToPiece } from '@/lib/access';
import Book from '@/models/Book';
import Piece from '@/models/Piece';
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const book = await Book.findById(params.id).populate('instrument', 'name slug').lean<any>() as any;
  if (!book) return fail('کتاب یافت نشد', 404);
  const session = await getSession();
  const pieces = await Piece.find({ book: book._id, isPublished: true }).sort({ order: 1 });
  const ent = await getUserEntitlements(session?.id);
  return ok({ ...book, pieces: pieces.map((p) => applyAccessToPiece(p, ent)) });
}

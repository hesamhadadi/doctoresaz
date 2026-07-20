export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { getUserEntitlements, applyAccessToPiece } from '@/lib/access';
import Piece from '@/models/Piece';
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const piece = await Piece.findById(params.id).populate('book', 'title slug price').populate('instrument', 'name slug');
  if (!piece) return fail('قطعه یافت نشد', 404);
  const session = await getSession();
  const ent = await getUserEntitlements(session?.id);
  return ok(applyAccessToPiece(piece, ent));
}

export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import User from '@/models/User';
import Piece from '@/models/Piece';
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const { pieceId, completed = true } = await req.json().catch(() => ({}));
  const piece = await Piece.findById(pieceId).select('book instrument').lean<any>() as any;
  if (!piece) return fail('قطعه یافت نشد', 404);
  const user = await User.findById(session!.id);
  const rec = user.progress.find((p: any) => String(p.piece) === String(pieceId));
  if (rec) { rec.completed = completed; rec.lastSeenAt = new Date(); }
  else user.progress.push({ piece: pieceId, book: piece.book, instrument: piece.instrument, completed });
  await user.save();
  return ok({ ok: true });
}

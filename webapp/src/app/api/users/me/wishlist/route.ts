export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, requireAuth } from '@/lib/api';
import User from '@/models/User';
export async function GET() {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const u = await User.findById(session!.id)
    .populate({ path: 'wishlistProducts', select: 'title slug coverImage fallbackImage price compareAtPrice stock ratingAvg' })
    .populate({ path: 'wishlistBooks', select: 'title slug coverImage price instrument' }).lean<any>() as any;
  return ok({ products: u?.wishlistProducts || [], books: u?.wishlistBooks || [] });
}
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const { kind, id } = await req.json().catch(() => ({}));
  const field = kind === 'book' ? 'wishlistBooks' : 'wishlistProducts';
  const user = await User.findById(session!.id);
  const idx = user[field].findIndex((x: any) => String(x) === String(id));
  const added = idx === -1;
  if (added) user[field].push(id); else user[field].splice(idx, 1);
  await user.save();
  return ok({ added, ids: user[field] });
}

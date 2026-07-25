export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok, requireAuth } from '@/lib/api';
import { getUserEntitlements } from '@/lib/access';
export async function GET() {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const e = await getUserEntitlements(session!.id);
  return ok({ pieces: [...e.pieces], books: [...e.books], instruments: [...e.instruments], products: [...e.products] });
}

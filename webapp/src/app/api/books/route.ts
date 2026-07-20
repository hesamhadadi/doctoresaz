export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok } from '@/lib/api';
import Book from '@/models/Book';
export async function GET(req: NextRequest) {
  await connectDB();
  const filter: any = { isPublished: true };
  const instrument = req.nextUrl.searchParams.get('instrument'); if (instrument) filter.instrument = instrument;
  return ok(await Book.find(filter).populate('instrument', 'name slug').sort({ order: 1 }).lean<any>());
}

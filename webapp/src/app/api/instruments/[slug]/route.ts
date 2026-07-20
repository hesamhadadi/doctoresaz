export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import Instrument from '@/models/Instrument';
import Book from '@/models/Book';
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB();
  const ins = await Instrument.findOne({ slug: params.slug }).lean<any>() as any;
  if (!ins) return fail('ساز یافت نشد', 404);
  const books = await Book.find({ instrument: ins._id, isPublished: true }).sort({ order: 1 }).lean<any>();
  return ok({ ...ins, books });
}

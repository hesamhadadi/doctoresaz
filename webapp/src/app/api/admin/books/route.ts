export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, requireRole } from '@/lib/api';
import Book from '@/models/Book';
import { uniqueSlug } from '@/lib/slug';
export async function GET() {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  return ok(await Book.find().sort({ createdAt: -1 }).lean<any>());
}
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const body = await req.json().catch(() => ({}));
  if (body.title) body.slug = await uniqueSlug(Book, body.slug || body.title);
  const doc = await Book.create({ ...body, createdBy: session!.id });
  return ok(doc, 201);
}

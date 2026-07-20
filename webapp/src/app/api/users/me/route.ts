export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, requireAuth } from '@/lib/api';
import User from '@/models/User';
export async function GET() {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  return ok(await User.findById(session!.id).lean<any>());
}
export async function PUT(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const patch: any = {}; for (const k of ['name', 'phone', 'bio', 'avatar']) if (body[k] !== undefined) patch[k] = body[k];
  return ok(await User.findByIdAndUpdate(session!.id, patch, { new: true }));
}

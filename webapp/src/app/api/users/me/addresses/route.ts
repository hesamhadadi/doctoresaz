export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, requireAuth } from '@/lib/api';
import User from '@/models/User';
export async function GET() {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const u = await User.findById(session!.id).lean<any>() as any;
  return ok(u?.addresses || []);
}
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const user = await User.findById(session!.id);
  if (body.isDefault) user.addresses.forEach((a: any) => (a.isDefault = false));
  if (!user.addresses.length) body.isDefault = true;
  user.addresses.push(body); await user.save();
  return ok(user.addresses, 201);
}

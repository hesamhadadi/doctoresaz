export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import User from '@/models/User';
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const user = await User.findById(session!.id);
  const addr = user.addresses.id(params.id);
  if (!addr) return fail('آدرس یافت نشد', 404);
  if (body.isDefault) user.addresses.forEach((a: any) => (a.isDefault = false));
  Object.assign(addr, body); await user.save();
  return ok(user.addresses);
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const user = await User.findById(session!.id);
  user.addresses.id(params.id)?.deleteOne();
  if (user.addresses.length && !user.addresses.some((a: any) => a.isDefault)) user.addresses[0].isDefault = true;
  await user.save();
  return ok(user.addresses);
}

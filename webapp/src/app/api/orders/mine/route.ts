export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok, requireAuth } from '@/lib/api';
import Order from '@/models/Order';
export async function GET() {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  return ok(await Order.find({ user: session!.id }).sort({ createdAt: -1 }).lean<any>());
}

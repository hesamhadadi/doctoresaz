export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import Order from '@/models/Order';
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const order = await Order.findOne({ _id: params.id, user: session!.id }).lean<any>();
  if (!order) return fail('سفارش یافت نشد', 404);
  return ok(order);
}

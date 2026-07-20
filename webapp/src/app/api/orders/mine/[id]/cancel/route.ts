export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import Order from '@/models/Order';
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const order = await Order.findOne({ _id: params.id, user: session!.id });
  if (!order) return fail('سفارش یافت نشد', 404);
  if (!['pending', 'paid', 'processing'].includes(order.status)) return fail('این سفارش در وضعیت قابل لغو نیست');
  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'لغو توسط کاربر' });
  await order.save();
  return ok(order);
}

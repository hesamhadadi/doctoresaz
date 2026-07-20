export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, requireRole } from '@/lib/api';
import Order from '@/models/Order';
export async function GET(req: NextRequest) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const status = req.nextUrl.searchParams.get('status');
  const filter: any = {}; if (status && status !== 'all') filter.status = status;
  const orders = await Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).limit(500).lean<any>();
  const q = req.nextUrl.searchParams.get('q')?.trim();
  const filtered = q ? orders.filter((o: any) => o.orderNumber?.includes(q) || o.user?.name?.includes(q) || o.user?.phone?.includes(q) || o.shippingAddress?.phone?.includes(q)) : orders;
  return ok(filtered);
}

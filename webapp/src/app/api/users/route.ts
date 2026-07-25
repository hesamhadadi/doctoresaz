export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok, requireRole } from '@/lib/api';
import User from '@/models/User';
import Order from '@/models/Order';
export async function GET() {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const users = await User.find().select('-progress').sort({ createdAt: -1 }).lean<any>() as any[];
  const spend = await Order.aggregate([{ $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } }, { $group: { _id: '$user', total: { $sum: '$total' }, n: { $sum: 1 } } }]);
  const map: any = Object.fromEntries(spend.map((s: any) => [String(s._id), s]));
  users.forEach((u) => { u.totalSpent = map[String(u._id)]?.total || 0; u.orderCount = map[String(u._id)]?.n || 0; });
  return ok(users);
}

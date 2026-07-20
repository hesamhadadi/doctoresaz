export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok, requireRole } from '@/lib/api';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Piece from '@/models/Piece';
import Book from '@/models/Book';
import Instrument from '@/models/Instrument';

const PAID = ['paid', 'processing', 'shipped', 'delivered'];
export async function GET() {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const from = new Date(); from.setDate(from.getDate() - 29); from.setHours(0, 0, 0, 0);
  const [rev, orderCount, pending, users, products, lowStock, instruments, books, pieces] = await Promise.all([
    Order.aggregate([{ $match: { status: { $in: PAID } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    Order.countDocuments({ status: { $in: PAID } }),
    Order.countDocuments({ status: { $in: ['pending', 'paid', 'processing'] } }),
    User.countDocuments(), Product.countDocuments({ isPublished: true }),
    Product.find({ isPublished: true, stock: { $lte: 3 } }).select('title slug stock coverImage fallbackImage').limit(8).lean<any>(),
    Instrument.countDocuments(), Book.countDocuments(), Piece.countDocuments(),
  ]);
  const daily = await Order.aggregate([
    { $match: { status: { $in: PAID }, createdAt: { $gte: from } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const series: any[] = [];
  for (let i = 0; i < 30; i++) { const d = new Date(from); d.setDate(from.getDate() + i); const key = d.toISOString().slice(0, 10); const hit = daily.find((x: any) => x._id === key); series.push({ date: key, revenue: hit?.revenue || 0, orders: hit?.orders || 0 }); }
  const topProducts = await Order.aggregate([
    { $match: { status: { $in: PAID } } }, { $unwind: '$items' }, { $match: { 'items.kind': 'product' } },
    { $group: { _id: '$items.product', title: { $first: '$items.title' }, image: { $first: '$items.image' }, qty: { $sum: '$items.qty' }, revenue: { $sum: '$items.lineTotal' } } },
    { $sort: { revenue: -1 } }, { $limit: 6 },
  ]);
  const mix = await Order.aggregate([
    { $match: { status: { $in: PAID } } }, { $unwind: '$items' },
    { $group: { _id: { $cond: [{ $eq: ['$items.kind', 'product'] }, 'physical', 'digital'] }, revenue: { $sum: '$items.lineTotal' } } },
  ]);
  const byStatus = await Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
  const recentOrders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 }).limit(8).lean<any>();
  return ok({
    kpis: { revenue: rev[0]?.sum || 0, orders: orderCount, pending, users, products, instruments, books, pieces },
    series, topProducts, mix: Object.fromEntries(mix.map((m: any) => [m._id, m.revenue])), byStatus: Object.fromEntries(byStatus.map((s: any) => [s._id, s.n])), lowStock, recentOrders,
  });
}

export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok, requireAuth } from '@/lib/api';
import { getUserEntitlements } from '@/lib/access';
import Order from '@/models/Order';
import User from '@/models/User';
import Book from '@/models/Book';
import Piece from '@/models/Piece';

export async function GET() {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const userId = session!.id;
  const [ent, orders, user] = await Promise.all([
    getUserEntitlements(userId),
    Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean<any>(),
    User.findById(userId).lean<any>() as any,
  ]);
  const or: any[] = [];
  if (ent.books.size) or.push({ _id: { $in: [...ent.books] } });
  if (ent.instruments.size) or.push({ instrument: { $in: [...ent.instruments] } });
  let courses: any[] = [];
  if (or.length) {
    const books = await Book.find({ $or: or }).populate('instrument', 'name slug').lean<any>() as any[];
    const bookIds = books.map((b) => b._id);
    const pieces = await Piece.find({ book: { $in: bookIds } }).select('book').lean<any>();
    const doneByBook: any = {};
    for (const p of user.progress || []) if (p.completed && p.book) doneByBook[String(p.book)] = (doneByBook[String(p.book)] || 0) + 1;
    courses = books.map((b) => {
      const total = pieces.filter((p: any) => String(p.book) === String(b._id)).length;
      const done = Math.min(doneByBook[String(b._id)] || 0, total);
      return { _id: b._id, title: b.title, slug: b.slug, coverImage: b.coverImage, instrument: b.instrument, total, done, percent: total ? Math.round((done / total) * 100) : 0 };
    });
  }
  const PAID = ['paid', 'processing', 'shipped', 'delivered'];
  const paidOrders = await Order.countDocuments({ user: userId, status: { $in: PAID } });
  const spent = await Order.aggregate([{ $match: { user: (await import('mongoose')).default.Types.ObjectId.createFromHexString(String(userId)), status: { $in: PAID } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]);
  return ok({
    stats: { courses: courses.length, completedPieces: (user.progress || []).filter((p: any) => p.completed).length, orders: paidOrders, totalSpent: spent[0]?.sum || 0, wishlist: (user.wishlistProducts?.length || 0) + (user.wishlistBooks?.length || 0) },
    courses, recentOrders: orders,
  });
}

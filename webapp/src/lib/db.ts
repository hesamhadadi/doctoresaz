import mongoose from 'mongoose';
import dns from 'node:dns';

// ثبت همه‌ی مدل‌ها هنگام بارگذاری لایه‌ی دیتابیس.
// در محیط serverless هر تابع فقط مدل‌های import‌شده را می‌شناسد؛ این importها
// تضمین می‌کنند populate روی instrument/book/... هرگز MissingSchemaError ندهد.
import '@/models/User';
import '@/models/Instrument';
import '@/models/Book';
import '@/models/Piece';
import '@/models/Package';
import '@/models/Category';
import '@/models/Product';
import '@/models/Review';
import '@/models/Cart';
import '@/models/Coupon';
import '@/models/Order';
import '@/models/Otp';

// اتصال امن و بهینه‌ی MongoDB برای محیط serverless (ورسل).
// اتصال در سطح global کش می‌شود تا در هر invocation دوباره ساخته نشود.

const MONGODB_URI = process.env.MONGODB_URI;

// رفع مشکل SRV lookup در شبکه‌های محدود (اختیاری)
try {
  const custom = process.env.MONGO_DNS?.split(',').map((s) => s.trim()).filter(Boolean);
  if (custom?.length) dns.setServers(custom);
} catch { /* از DNS سیستم استفاده می‌شود */ }

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
const globalForMongoose = globalThis as unknown as { _mongoose?: Cached };
const cached: Cached = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error('MONGODB_URI تعریف نشده است');

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

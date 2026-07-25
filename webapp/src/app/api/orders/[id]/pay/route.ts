export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Cart from '@/models/Cart';
import User from '@/models/User';
import { sendSms, smsTemplates, ADMIN_PHONE } from '@/lib/sms';
import { toman } from '@/lib/format';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const order = await Order.findOne({ _id: params.id, user: session!.id });
  if (!order) return fail('سفارش یافت نشد', 404);
  if (order.status !== 'pending') return ok(order);

  // ─── درگاه شبیه‌سازی‌شده (Mock) — برای درگاه واقعی این بلوک را جایگزین کنید ───
  order.status = 'paid';
  order.paidAt = new Date();
  order.paymentRef = `MOCK-${Date.now()}`;
  order.statusHistory.push({ status: 'paid', note: 'پرداخت با موفقیت انجام شد' });
  // ──────────────────────────────────────────────────────────────────────

  await order.save();
  for (const it of order.items) {
    if (it.kind !== 'product' || !it.product) continue;
    if (it.variantId) await Product.updateOne({ _id: it.product, 'variants._id': it.variantId }, { $inc: { 'variants.$.stock': -it.qty, soldCount: it.qty } });
    else await Product.updateOne({ _id: it.product }, { $inc: { stock: -it.qty, soldCount: it.qty } });
  }
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  await Cart.updateOne({ user: session!.id }, { $set: { items: [], couponCode: '' } });

  // اعلان خرید به مدیر (شامل موبایل خریدار تا از پنل اضافه کند)
  try {
    const buyer = await User.findById(session!.id).lean<any>() as any;
    const buyerPhone = order.shippingAddress?.phone || buyer?.phone || '—';
    if (ADMIN_PHONE) await sendSms(ADMIN_PHONE, smsTemplates.orderPlacedToAdmin(order.orderNumber, buyerPhone, toman(order.total)));
  } catch { /* پیامک نباید جریان پرداخت را متوقف کند */ }

  return ok(order);
}

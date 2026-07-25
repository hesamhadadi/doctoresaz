export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import User from '@/models/User';
import { buildCartSummary } from '@/lib/cart';
import { calcShipping, SHIPPING_METHODS } from '@/lib/shipping';

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const cart = await Cart.findOne({ user: session!.id });
  if (!cart || !cart.items.length) return fail('سبد خرید خالی است');
  const summary = await buildCartSummary(cart);
  if (!summary.items.length) return fail('سبد خرید خالی است');
  const outOfStock = summary.items.filter((i: any) => i.isPhysical && !i.inStock);
  if (outOfStock.length) return fail(`موجودی «${outOfStock[0].title}» تمام شده است`);

  const body = await req.json().catch(() => ({}));
  let shippingAddress: any = null, shippingMethod = 'none', shippingCost = 0;
  if (summary.hasPhysical) {
    const user = await User.findById(session!.id);
    const { addressId, shippingAddress: raw, shippingMethod: method = 'post', note } = body;
    if (addressId) {
      const addr = user?.addresses.id(addressId);
      if (!addr) return fail('آدرس یافت نشد');
      shippingAddress = { fullName: addr.fullName, phone: addr.phone, province: addr.province, city: addr.city, address: addr.address, postalCode: addr.postalCode, note: note || '' };
    } else if (raw?.address && raw?.city && raw?.phone) shippingAddress = raw;
    else return fail('آدرس ارسال را وارد کنید');
    shippingMethod = SHIPPING_METHODS[method] ? method : 'post';
    shippingCost = calcShipping({ method: shippingMethod, weightGrams: summary.weightGrams, subtotal: summary.subtotal - summary.discount, hasPhysical: true });
  }
  const total = Math.max(0, summary.subtotal - summary.discount + shippingCost);
  const order = await Order.create({
    user: session!.id,
    items: summary.items.map((i: any) => ({ kind: i.kind, product: i.product, variantId: i.variantId, variantName: i.variantName, piece: i.piece, book: i.book, package: i.package, title: i.title, image: i.image, unitPrice: i.unitPrice, qty: i.qty, lineTotal: i.lineTotal })),
    subtotal: summary.subtotal, discount: summary.discount, couponCode: summary.couponCode, shippingCost, total,
    hasPhysical: summary.hasPhysical, shippingMethod, shippingAddress, status: 'pending',
    statusHistory: [{ status: 'pending', note: 'سفارش ثبت شد' }],
  });
  return ok(order, 201);
}

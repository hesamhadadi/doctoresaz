export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireRole } from '@/lib/api';
import Order, { ORDER_STATUSES } from '@/models/Order';
import User from '@/models/User';
import { sendSms, smsTemplates } from '@/lib/sms';
import { ORDER_STATUS } from '@/lib/format';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const { status, note = '', trackingCode } = await req.json().catch(() => ({}));
  if (!ORDER_STATUSES.includes(status)) return fail('وضعیت نامعتبر است');
  const order = await Order.findById(params.id).populate('user', 'phone name');
  if (!order) return fail('سفارش یافت نشد', 404);
  order.status = status;
  if (trackingCode !== undefined) order.trackingCode = trackingCode;
  if (status === 'paid' && !order.paidAt) order.paidAt = new Date();
  order.statusHistory.push({ status, note });
  await order.save();

  // پیامک تغییر وضعیت به کاربر
  try {
    const phone = (order.user as any)?.phone || order.shippingAddress?.phone;
    if (phone) await sendSms(phone, smsTemplates.statusToUser(order.orderNumber, ORDER_STATUS[status]?.label || status, order.trackingCode));
  } catch { /* بی‌صدا */ }

  return ok(order);
}

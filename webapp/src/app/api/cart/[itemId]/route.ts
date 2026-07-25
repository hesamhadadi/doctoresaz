export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import { buildCartSummary, getOrCreateCart } from '@/lib/cart';

export async function PUT(req: NextRequest, { params }: { params: { itemId: string } }) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const cart = await getOrCreateCart(session!.id);
  const item = cart.items.id(params.itemId);
  if (!item) return fail('آیتم یافت نشد', 404);
  const qty = Number((await req.json().catch(() => ({}))).qty);
  if (qty <= 0) item.deleteOne(); else item.qty = qty;
  await cart.save();
  return ok(await buildCartSummary(cart));
}
export async function DELETE(_req: NextRequest, { params }: { params: { itemId: string } }) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const cart = await getOrCreateCart(session!.id);
  cart.items.id(params.itemId)?.deleteOne();
  await cart.save();
  return ok(await buildCartSummary(cart));
}

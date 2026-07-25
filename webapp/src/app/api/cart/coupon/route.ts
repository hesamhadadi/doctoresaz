export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import { buildCartSummary, getOrCreateCart } from '@/lib/cart';

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const cart = await getOrCreateCart(session!.id);
  cart.couponCode = String((await req.json().catch(() => ({}))).code || '').toUpperCase().trim();
  await cart.save();
  const summary = await buildCartSummary(cart);
  if (cart.couponCode && !summary.couponCode) { cart.couponCode = ''; await cart.save(); return fail('کد تخفیف نامعتبر یا منقضی است'); }
  return ok(summary);
}

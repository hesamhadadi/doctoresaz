export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireAuth } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { getUserEntitlements } from '@/lib/access';
import { buildCartSummary, getOrCreateCart } from '@/lib/cart';

export async function GET() {
  const session = await getSession();
  if (!session) return ok({ items: [], subtotal: 0, discount: 0, couponCode: '', count: 0, hasPhysical: false, weightGrams: 0 });
  await connectDB();
  const cart = await getOrCreateCart(session.id);
  return ok(await buildCartSummary(cart));
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const { kind, id, variantId = null, qty = 1 } = await req.json().catch(() => ({}));
  if (!['product', 'piece', 'book', 'package'].includes(kind)) return fail('نوع آیتم نامعتبر است');
  if (kind !== 'product') {
    const ent = await getUserEntitlements(session!.id);
    if ((kind === 'piece' && ent.pieces.has(String(id))) || (kind === 'book' && ent.books.has(String(id)))) return fail('شما قبلاً این مورد را خریده‌اید');
  }
  const cart = await getOrCreateCart(session!.id);
  const existing = cart.items.find((i: any) => i.kind === kind && String(i[kind]) === String(id) && String(i.variantId || '') === String(variantId || ''));
  if (existing) { if (kind === 'product') existing.qty += qty; else return fail('این مورد در سبد شماست'); }
  else cart.items.push({ kind, [kind]: id, variantId, qty: kind === 'product' ? qty : 1 });
  await cart.save();
  return ok(await buildCartSummary(cart), 201);
}

export async function DELETE() {
  const { session, error } = await requireAuth(); if (error) return error;
  await connectDB();
  const cart = await getOrCreateCart(session!.id);
  cart.items = []; cart.couponCode = ''; await cart.save();
  return ok(await buildCartSummary(cart));
}

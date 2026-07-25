import Product from '@/models/Product';
import Piece from '@/models/Piece';
import Book from '@/models/Book';
import Package from '@/models/Package';
import Coupon from '@/models/Coupon';
import Cart from '@/models/Cart';

export async function resolveCartItem(item: any) {
  const { kind, qty = 1 } = item;

  if (kind === 'product') {
    const p = (await Product.findById(item.product).lean({ virtuals: true })) as any;
    if (!p || !p.isPublished) return null;
    const variant = item.variantId
      ? p.variants?.find((v: any) => String(v._id) === String(item.variantId))
      : null;
    const unitPrice = p.price + (variant?.priceDiff || 0);
    const available = variant ? variant.stock : p.stock;
    const q = Math.max(1, Math.min(qty, Math.max(available, 0) || 1));
    return {
      kind,
      product: p._id,
      variantId: variant?._id || null,
      variantName: variant?.name || '',
      title: p.title,
      slug: p.slug,
      image: variant?.image || p.coverImage,
      fallbackImage: p.fallbackImage,
      unitPrice,
      qty: q,
      lineTotal: unitPrice * q,
      weightGrams: (p.weightGrams || 0) * q,
      stock: available,
      inStock: available > 0,
      isPhysical: true,
    };
  }

  const map: any = { piece: Piece, book: Book, package: Package };
  const Model = map[kind];
  if (!Model) return null;

  const doc = (await Model.findById(item[kind]).lean()) as any;
  if (!doc) return null;
  return {
    kind,
    [kind]: doc._id,
    title: doc.title,
    image: doc.coverImage || '',
    unitPrice: doc.price || 0,
    qty: 1,
    lineTotal: doc.price || 0,
    weightGrams: 0,
    inStock: true,
    isPhysical: false,
  };
}

export async function buildCartSummary(cart: any) {
  const resolved: any[] = [];
  for (const it of cart.items) {
    const r = await resolveCartItem(it);
    if (r) resolved.push({ ...r, _id: it._id });
  }
  const subtotal = resolved.reduce((s, i) => s + i.lineTotal, 0);
  const weightGrams = resolved.reduce((s, i) => s + (i.weightGrams || 0), 0);
  const hasPhysical = resolved.some((i) => i.isPhysical);

  let discount = 0;
  let coupon: any = null;
  if (cart.couponCode) {
    coupon = (await Coupon.findOne({ code: cart.couponCode, isActive: true }).lean()) as any;
    const valid =
      coupon &&
      subtotal >= (coupon.minAmount || 0) &&
      (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);
    if (valid) {
      discount =
        coupon.type === 'percent'
          ? Math.round((subtotal * coupon.value) / 100)
          : coupon.value;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      discount = Math.min(discount, subtotal);
    } else {
      coupon = null;
    }
  }

  return {
    items: resolved,
    subtotal,
    discount,
    couponCode: coupon?.code || '',
    weightGrams,
    hasPhysical,
    count: resolved.reduce((s, i) => s + i.qty, 0),
  };
}

export async function getOrCreateCart(userId: string) {
  return (
    (await Cart.findOne({ user: userId })) ||
    (await Cart.create({ user: userId, items: [] }))
  );
}
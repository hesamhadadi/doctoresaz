import Order from '@/models/Order';
import Piece from '@/models/Piece';

const OWNED = ['paid', 'processing', 'shipped', 'delivered'];

export interface Entitlements { pieces: Set<string>; books: Set<string>; instruments: Set<string>; products: Set<string> }

export async function getUserEntitlements(userId?: string): Promise<Entitlements> {
  const empty: Entitlements = { pieces: new Set(), books: new Set(), instruments: new Set(), products: new Set() };
  if (!userId) return empty;
  const orders = await Order.find({ user: userId, status: { $in: OWNED } }).populate('items.package').lean<any>();
  const e = empty;
  for (const o of orders as any[]) {
    for (const it of o.items || []) {
      if (it.kind === 'piece' && it.piece) e.pieces.add(String(it.piece));
      if (it.kind === 'book' && it.book) e.books.add(String(it.book));
      if (it.kind === 'product' && it.product) e.products.add(String(it.product));
      if (it.kind === 'package' && it.package) {
        const p = it.package;
        if (p?.scope === 'instrument' && p.instrument) e.instruments.add(String(p.instrument));
        if (p?.scope === 'book' && p.book) e.books.add(String(p.book));
      }
    }
  }
  return e;
}

export function canAccessPiecePaid(piece: any, e: Entitlements): boolean {
  if (!piece || !e) return false;
  if (e.pieces.has(String(piece._id))) return true;
  if (piece.book && e.books.has(String(piece.book._id || piece.book))) return true;
  if (piece.instrument && e.instruments.has(String(piece.instrument._id || piece.instrument))) return true;
  return false;
}

export function applyAccessToPiece(pieceDoc: any, e: Entitlements) {
  const piece = pieceDoc.toObject ? pieceDoc.toObject() : { ...pieceDoc };
  const owned = canAccessPiecePaid(piece, e);
  const gate = (a: any) => {
    if (!a) return { isFree: false, locked: true, url: '', exists: false };
    const unlocked = a.isFree || owned;
    return { isFree: a.isFree, locked: !unlocked, exists: Boolean(a.url), url: unlocked ? a.url : '' };
  };
  piece.introVideo = gate(piece.introVideo);
  piece.pdf = gate(piece.pdf);
  piece.lessonVideo = gate(piece.lessonVideo);
  piece.audioGuide = gate(piece.audioGuide);
  piece.owned = owned;
  return piece;
}

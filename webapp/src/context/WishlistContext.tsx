'use client';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { apiGet, apiPost } from '@/lib/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext<any>(null);
export const useWishlist = () => useContext(WishlistContext);
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const refresh = useCallback(async () => {
    if (!user) { setProducts([]); setBooks([]); return; }
    try { const d = await apiGet('/users/me/wishlist'); setProducts(d.products || []); setBooks(d.books || []); } catch {}
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const has = (kind: string, id: string) => (kind === 'book' ? books : products).some((x) => String(x._id) === String(id));
  const toggle = async (kind: string, id: string) => {
    if (!user) return toast.error('برای ذخیره‌کردن، ابتدا وارد شوید');
    try { const d = await apiPost('/users/me/wishlist', { kind, id }); toast.success(d.added ? 'به علاقه‌مندی‌ها اضافه شد' : 'حذف شد'); refresh(); } catch { toast.error('خطا'); }
  };
  return <WishlistContext.Provider value={{ products, books, count: products.length + books.length, has, toggle, refresh }}>{children}</WishlistContext.Provider>;
}

'use client';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const EMPTY = { items: [] as any[], subtotal: 0, discount: 0, couponCode: '', count: 0, hasPhysical: false, weightGrams: 0 };
const CartContext = createContext<any>(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const refresh = useCallback(async () => {
    if (!user) return setCart(EMPTY);
    try { setCart(await apiGet('/cart')); } catch {}
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const run = async (fn: () => Promise<any>, msg?: string) => {
    setLoading(true);
    try { const data = await fn(); setCart(data); if (msg) toast.success(msg); return data; }
    catch (e: any) { toast.error(e.message || 'خطایی رخ داد'); throw e; }
    finally { setLoading(false); }
  };
  const add = async (payload: any, opts: { silent?: boolean; openDrawer?: boolean } = {}) => {
    if (!user) return toast.error('برای افزودن به سبد، ابتدا وارد شوید');
    try { await run(() => apiPost('/cart', payload), opts.silent ? undefined : 'به سبد خرید اضافه شد'); if (opts.openDrawer !== false) setOpen(true); } catch {}
  };
  const setQty = (itemId: string, qty: number) => run(() => apiPut(`/cart/${itemId}`, { qty }));
  const remove = (itemId: string) => run(() => apiDelete(`/cart/${itemId}`), 'از سبد حذف شد');
  const clear = () => run(() => apiDelete('/cart'));
  const applyCoupon = (code: string) => run(() => apiPost('/cart/coupon', { code }), 'کد تخفیف اعمال شد');
  const total = Math.max(0, cart.subtotal - cart.discount);
  return <CartContext.Provider value={{ cart, total, loading, open, setOpen, refresh, add, setQty, remove, clear, applyCoupon }}>{children}</CartContext.Provider>;
}

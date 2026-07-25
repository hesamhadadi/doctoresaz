'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, mediaUrl } from '@/lib/client';
import { toman } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import Empty from '@/components/ui/Empty';
import AddressForm from '@/components/AddressForm';
import { SkeletonLines } from '@/components/ui/Skeleton';

const FREE_AT = 15_000_000;

// تسویه‌ی تک‌صفحه‌ای — همه‌چیز در یک نما، بدون رفت‌وبرگشت بین مراحل
export default function Checkout() {
  const { cart, total, refresh } = useCart();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState<any>(null);
  const [method, setMethod] = useState('post');
  const [methods, setMethods] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => { apiGet('/orders/shipping-methods').then(setMethods).catch(() => {}); }, []);
  const loadAddresses = () => apiGet('/users/me/addresses').then((data) => {
    setAddresses(data);
    setAddressId((cur: any) => cur || data.find((a: any) => a.isDefault)?._id || data[0]?._id || null);
  }).catch(() => {});
  useEffect(() => { if (user) loadAddresses(); }, [user]);

  if (authLoading) return <div className="container py-20"><SkeletonLines count={4} /></div>;
  if (!cart.items.length) {
    return <div className="container py-10"><Empty icon="cart" title="سبد خرید خالی است" description="ابتدا محصولی انتخاب کنید." action="رفتن به فروشگاه" href="/shop" /></div>;
  }

  const chosen = methods.find((m) => m.key === method);
  const shipping = !cart.hasPhysical ? 0 : total >= FREE_AT ? 0
    : (chosen?.base || 0) + (chosen?.perKg || 0) * Math.max(0, Math.ceil(cart.weightGrams / 1000) - 1);
  const grand = total + shipping;
  const ready = !cart.hasPhysical || Boolean(addressId);

  const placeOrder = async () => {
    if (!ready) return toast.error('لطفاً آدرس تحویل را انتخاب کنید');
    setBusy(true);
    try {
      const order = await apiPost('/orders/checkout', { addressId: cart.hasPhysical ? addressId : undefined, shippingMethod: method, note });
      const paid = await apiPost(`/orders/${order._id}/pay`);
      await refresh();
      toast.success('پرداخت با موفقیت انجام شد');
      router.push(`/checkout/success/${paid._id}`);
    } catch (e: any) {
      toast.error(e.message || 'ثبت سفارش ناموفق بود');
    } finally { setBusy(false); }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-7 flex items-center justify-between gap-3">
        <h1 className="text-2xl">تسویه‌حساب</h1>
        <Link href="/cart" className="btn-ghost btn-sm text-xs"><Icon name="chevronRight" size={14} /> بازگشت به سبد</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {/* آدرس — فقط برای سفارش فیزیکی */}
          {cart.hasPhysical && (
            <section className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-base">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-firooze-500/12 text-firooze-600"><Icon name="map" size={15} /></span>
                آدرس تحویل
              </h2>
              {addresses.length === 0 && !showForm && <p className="mb-3 text-sm text-ink-400">هنوز آدرسی ثبت نکرده‌اید.</p>}
              <div className="space-y-2.5">
                {addresses.map((a) => (
                  <label key={a._id} className={`press flex cursor-pointer gap-3 rounded-2xl border p-4 transition-all ${String(a._id) === String(addressId) ? 'border-firooze-500 bg-firooze-500/[.06] shadow-soft' : 'border-ink-750 hover:border-ink-600'}`}>
                    <input type="radio" name="addr" checked={String(a._id) === String(addressId)} onChange={() => setAddressId(a._id)} className="mt-1 accent-firooze-500" />
                    <div className="min-w-0 text-[13px]">
                      <p className="mb-1 flex items-center gap-2 font-medium text-ink-50">{a.fullName}<span className="badge-neutral">{a.label}</span></p>
                      <p className="leading-6 text-ink-300">{a.province}، {a.city} — {a.address}</p>
                      <p className="num mt-1 text-ink-500">{a.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
              {showForm ? (
                <div className="mt-3 rounded-2xl border border-ink-750 p-4">
                  <AddressForm onDone={() => { setShowForm(false); loadAddresses(); }} onCancel={() => setShowForm(false)} />
                </div>
              ) : (
                <button onClick={() => setShowForm(true)} className="btn-outline btn-sm mt-3"><Icon name="plus" size={15} /> افزودن آدرس جدید</button>
              )}
            </section>
          )}

          {/* روش ارسال */}
          {cart.hasPhysical && (
            <section className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-base">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-firooze-500/12 text-firooze-600"><Icon name="truck" size={15} /></span>
                روش ارسال
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {methods.map((m) => (
                  <label key={m.key} className={`press flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition-all ${method === m.key ? 'border-firooze-500 bg-firooze-500/[.06] shadow-soft' : 'border-ink-750 hover:border-ink-600'}`}>
                    <input type="radio" name="ship" checked={method === m.key} onChange={() => setMethod(m.key)} className="sr-only" />
                    <span className="flex items-center gap-2 text-[13px] font-medium text-ink-50"><Icon name="truck" size={15} className="text-ink-400" />{m.label}</span>
                    <span className="text-[11px] text-ink-400">{m.days}</span>
                    <span className="num mt-1 text-[13px] font-semibold text-firooze-600">{total >= FREE_AT ? 'رایگان' : m.base ? toman(m.base) : 'پس‌کرایه'}</span>
                  </label>
                ))}
              </div>
              <div className="field mt-4">
                <label className="label">یادداشت سفارش (اختیاری)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="مثلاً: بعدازظهرها تحویل بگیرید" />
              </div>
            </section>
          )}

          {/* اقلام */}
          <section className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-firooze-500/12 text-firooze-600"><Icon name="package" size={15} /></span>
              اقلام سفارش
            </h2>
            <ul className="space-y-2.5">
              {cart.items.map((it: any) => (
                <li key={it._id} className="flex items-center gap-3 rounded-xl border border-ink-800 p-2.5">
                  <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                    {it.image && <img src={mediaUrl(it.image)} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-[13px]">
                    <p className="clamp-1 text-ink-50">{it.title}</p>
                    {it.variantName && <p className="text-[11px] text-ink-400">{it.variantName}</p>}
                    <p className="num text-[11px] text-ink-500">تعداد: {it.qty.toLocaleString('fa-IR')}</p>
                  </div>
                  <span className="num text-[13px] font-semibold text-ink-100">{toman(it.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* فاکتور چسبان */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-5">
            <h2 className="mb-4 text-base">فاکتور</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink-300">جمع کالاها</dt><dd className="num text-ink-100">{toman(cart.subtotal)}</dd></div>
              {cart.discount > 0 && <div className="flex justify-between text-firooze-600"><dt>تخفیف</dt><dd className="num">−{cart.discount.toLocaleString('fa-IR')}</dd></div>}
              {cart.hasPhysical && <div className="flex justify-between"><dt className="text-ink-300">هزینه ارسال</dt><dd className="num text-ink-100">{shipping === 0 ? 'رایگان' : toman(shipping)}</dd></div>}
            </dl>
            <div className="divider my-4" />
            <div className="mb-5 flex items-baseline justify-between">
              <span className="text-sm text-ink-200">قابل پرداخت</span>
              <span className="num text-xl font-bold text-firooze-600">{toman(grand)}</span>
            </div>

            <button onClick={placeOrder} disabled={busy || !ready} className="btn-primary btn-lg w-full">
              {busy ? 'در حال پردازش…' : <><Icon name="shield" size={18} /> پرداخت و ثبت سفارش</>}
            </button>
            {!ready && <p className="hint mt-2 text-center">برای ادامه، آدرس تحویل را انتخاب کنید</p>}

            {cart.hasPhysical && total < FREE_AT && (
              <p className="mt-4 rounded-xl bg-firooze-500/[.07] p-3 text-[11px] leading-5 text-ink-300">
                <Icon name="truck" size={12} className="ml-1 inline text-firooze-600" />
                با <span className="num font-semibold text-firooze-600">{(FREE_AT - total).toLocaleString('fa-IR')}</span> تومان خرید بیشتر، ارسال رایگان می‌شود.
              </p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
              <Icon name="lock" size={12} /> پرداخت امن — اطلاعات شما محفوظ است
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

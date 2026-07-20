'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import Empty from '@/components/ui/Empty';
import AddressForm from '@/components/AddressForm';
import { SkeletonLines } from '@/components/ui/Skeleton';

const STEPS = [
  { key: 'address', label: 'آدرس و ارسال', icon: 'map' },
  { key: 'review', label: 'بازبینی', icon: 'file' },
  { key: 'pay', label: 'پرداخت', icon: 'wallet' },
];

export default function Checkout() {
  const { cart, total, refresh } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState<any>(null);
  const [method, setMethod] = useState('post');
  const [methods, setMethods] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<any>(null); // تا بارگذاری سبد، مرحله تعیین نمی‌شود
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    apiGet('/orders/shipping-methods').then((data) => setMethods(data)).catch(() => {});
  }, []);

  const loadAddresses = () =>
    apiGet('/users/me/addresses').then((data) => {
      setAddresses(data);
      setAddressId((cur) => cur || data.find((a) => a.isDefault)?._id || data[0]?._id || null);
    }).catch(() => {});

  useEffect(() => { if (user) loadAddresses(); }, [user]);
  // مرحله‌ی شروع فقط یک‌بار و پس از آماده‌شدن سبد تعیین می‌شود:
  // سفارش فیزیکی از «آدرس» شروع می‌شود، سفارش دیجیتال مستقیم از «بازبینی».
  useEffect(() => {
    if (step === null && cart.items.length) setStep(cart.hasPhysical ? 0 : 1);
  }, [cart.items.length, cart.hasPhysical, step]);

  if (!cart.items.length) {
    return (
      <div className="container py-10">
        <Empty icon="cart" title="سبد خرید خالی است" description="ابتدا محصولی انتخاب کنید." action="رفتن به فروشگاه" href="/shop" />
      </div>
    );
  }

  const chosen = methods.find((m) => m.key === method);
  const FREE_AT = 15_000_000;
  const shipping = !cart.hasPhysical
    ? 0
    : total >= FREE_AT
    ? 0
    : (chosen?.base || 0) + (chosen?.perKg || 0) * Math.max(0, Math.ceil(cart.weightGrams / 1000) - 1);
  const grand = total + shipping;

  const placeOrder = async () => {
    setBusy(true);
    try {
      const { data: order } = await apiPost('/orders/checkout', {
        addressId: cart.hasPhysical ? addressId : undefined,
        shippingMethod: method,
        note,
      });
      const { data: paid } = await apiPost(`/orders/${order._id}/pay`);
      await refresh();
      toast.success('پرداخت با موفقیت انجام شد');
      router.push(`/checkout/success/${paid._id}`);
    } catch (e: any) {
      toast.error((e as any).message || 'ثبت سفارش ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  const canNext = step === 0 ? Boolean(addressId) : true;
  if (step === null) return <div className="container py-20"><SkeletonLines count={4} /></div>;

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="mb-8">تسویه‌حساب</h1>

      {/* مراحل */}
      <ol className="mb-9 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const skip = s.key === 'address' && !cart.hasPhysical;
          const done = i < step;
          const now = i === step;
          return (
            <li key={s.key} className={`flex flex-1 items-center gap-2.5 ${skip ? 'opacity-35' : ''}`}>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold transition-colors ${
                  done ? 'bg-firooze-500 text-ink-950' : now ? 'bg-firooze-500/15 text-firooze-300 ring-1 ring-firooze-500/40' : 'bg-ink-800 text-ink-500'
                }`}
              >
                {done ? <Icon name="check" size={15} /> : <Icon name={s.icon} size={15} />}
              </span>
              <span className={`hidden text-[13px] sm:block ${now ? 'text-ink-50' : 'text-ink-400'}`}>{s.label}</span>
              {i < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-firooze-500/50' : 'bg-ink-800'}`} />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* گام ۱: آدرس */}
          {step === 0 && (
            <div className="space-y-5">
              <section>
                <h3 className="mb-3 text-base">آدرس تحویل</h3>
                {addresses.length === 0 && !showForm && (
                  <p className="mb-3 text-sm text-ink-400">هنوز آدرسی ثبت نکرده‌اید.</p>
                )}
                <div className="space-y-2.5">
                  {addresses.map((a) => (
                    <label
                      key={a._id}
                      className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
                        String(a._id) === String(addressId) ? 'border-firooze-500 bg-firooze-500/[.06]' : 'border-ink-750 hover:border-ink-600'
                      }`}
                    >
                      <input type="radio" name="addr" checked={String(a._id) === String(addressId)} onChange={() => setAddressId(a._id)} className="mt-1 accent-firooze-500" />
                      <div className="min-w-0 text-[13px]">
                        <p className="mb-1 flex items-center gap-2 font-medium text-ink-50">
                          {a.fullName}
                          <span className="badge-neutral">{a.label}</span>
                        </p>
                        <p className="leading-6 text-ink-300">{a.province}، {a.city} — {a.address}</p>
                        <p className="num mt-1 text-ink-500">{a.phone}{a.postalCode && ` · کدپستی ${a.postalCode}`}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {showForm ? (
                  <div className="card mt-3 p-4">
                    <AddressForm
                      onDone={() => { setShowForm(false); loadAddresses(); }}
                      onCancel={() => setShowForm(false)}
                    />
                  </div>
                ) : (
                  <button onClick={() => setShowForm(true)} className="btn-outline btn-sm mt-3">
                    <Icon name="plus" size={15} /> افزودن آدرس جدید
                  </button>
                )}
              </section>

              <section>
                <h3 className="mb-3 text-base">روش ارسال</h3>
                <div className="space-y-2.5">
                  {methods.map((m) => (
                    <label
                      key={m.key}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
                        method === m.key ? 'border-firooze-500 bg-firooze-500/[.06]' : 'border-ink-750 hover:border-ink-600'
                      }`}
                    >
                      <input type="radio" name="ship" checked={method === m.key} onChange={() => setMethod(m.key)} className="accent-firooze-500" />
                      <Icon name="truck" size={18} className="text-ink-400" />
                      <div className="min-w-0 flex-1 text-[13px]">
                        <p className="font-medium text-ink-50">{m.label}</p>
                        <p className="text-[11px] text-ink-400">{m.days}{m.note && ` · ${m.note}`}</p>
                      </div>
                      <span className="num text-sm text-ink-200">
                        {total >= FREE_AT ? 'رایگان' : m.base ? m.base.toLocaleString('fa-IR') : 'پس‌کرایه'}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <div className="field">
                <label className="label">یادداشت برای سفارش (اختیاری)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="textarea" placeholder="مثلاً: بعدازظهرها تحویل بگیرید" />
              </div>
            </div>
          )}

          {/* گام ۲: بازبینی */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base">بازبینی سفارش</h3>
              <div className="space-y-2.5">
                {cart.items.map((it) => (
                  <div key={it._id} className="card flex items-center gap-3 p-3">
                    <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                      {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1 text-[13px]">
                      <p className="clamp-1 text-ink-50">{it.title}</p>
                      {it.variantName && <p className="text-[11px] text-ink-400">{it.variantName}</p>}
                      <p className="num text-[11px] text-ink-500">تعداد: {it.qty.toLocaleString('fa-IR')}</p>
                    </div>
                    <span className="num text-sm text-ink-100">{toman(it.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {cart.hasPhysical && addressId && (
                <div className="card p-4 text-[13px]">
                  <p className="mb-2 flex items-center gap-2 font-medium text-ink-50">
                    <Icon name="map" size={15} className="text-firooze-400" /> ارسال به
                  </p>
                  {(() => {
                    const a = addresses.find((x) => String(x._id) === String(addressId));
                    return a ? (
                      <p className="leading-7 text-ink-300">
                        {a.fullName} — {a.province}، {a.city}، {a.address}
                        <br />
                        <span className="num text-ink-500">{a.phone}</span>
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* گام ۳: پرداخت */}
          {step === 2 && (
            <div className="card p-6 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-firooze-500/12 text-firooze-300">
                <Icon name="wallet" size={28} />
              </div>
              <h3 className="mb-2">پرداخت مبلغ {toman(grand)}</h3>
              <p className="mb-6 text-sm leading-7 text-ink-400">
                در حال حاضر درگاه پرداخت در <b className="text-zaferan-300">حالت آزمایشی</b> است و پرداخت
                بلافاصله تأیید می‌شود. برای اتصال درگاه واقعی، بخش MOCK در فایل
                <code className="mx-1 rounded bg-ink-800 px-1.5 py-0.5 text-[11px]">orderController.js</code>
                جایگزین شود.
              </p>
              <button onClick={placeOrder} disabled={busy} className="btn-primary btn-lg w-full">
                {busy ? 'در حال پردازش…' : 'پرداخت و ثبت نهایی سفارش'}
              </button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            {step > (cart.hasPhysical ? 0 : 1) ? (
              <button onClick={() => setStep(step - 1)} className="btn-outline">
                <Icon name="chevronRight" size={16} /> مرحله‌ی قبل
              </button>
            ) : (
              <Link href="/cart" className="btn-ghost btn-sm">بازگشت به سبد</Link>
            )}
            {step < 2 && (
              <button onClick={() => setStep(step + 1)} disabled={!canNext} className="btn-primary">
                مرحله‌ی بعد <Icon name="arrowLeft" size={16} />
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-5">
            <h3 className="mb-4 text-base">فاکتور</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-300">جمع کالاها</span><span className="num text-ink-100">{toman(cart.subtotal)}</span></div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-firooze-300"><span>تخفیف</span><span className="num">−{cart.discount.toLocaleString('fa-IR')}</span></div>
              )}
              {cart.hasPhysical && (
                <div className="flex justify-between">
                  <span className="text-ink-300">هزینه ارسال</span>
                  <span className="num text-ink-100">{shipping === 0 ? 'رایگان' : toman(shipping)}</span>
                </div>
              )}
            </div>
            <div className="divider my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-200">قابل پرداخت</span>
              <span className="num text-xl font-bold text-firooze-300">{toman(grand)}</span>
            </div>
            {cart.hasPhysical && total < FREE_AT && (
              <p className="mt-3 text-[11px] leading-5 text-ink-400">
                <Icon name="truck" size={12} className="ml-1 inline" />
                با <span className="num">{(FREE_AT - total).toLocaleString('fa-IR')}</span> تومان خرید بیشتر، ارسال رایگان می‌شود.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

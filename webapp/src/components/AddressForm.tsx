'use client';
import { useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { useToast } from '@/context/ToastContext';

const PROVINCES = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'آذربایجان غربی', 'البرز',
  'مازندران', 'گیلان', 'کرمان', 'خوزستان', 'یزد', 'قم', 'کردستان', 'کرمانشاه', 'همدان',
  'گلستان', 'اردبیل', 'زنجان', 'سمنان', 'مرکزی', 'قزوین', 'لرستان', 'بوشهر', 'هرمزگان',
  'سیستان و بلوچستان', 'چهارمحال و بختیاری', 'کهگیلویه و بویراحمد', 'ایلام', 'خراسان شمالی',
  'خراسان جنوبی',
];

const EMPTY = { label: 'خانه', fullName: '', phone: '', province: 'تهران', city: '', address: '', postalCode: '', isDefault: false };

export default function AddressForm({ initial = null, onDone, onCancel }: any) {
  const toast = useToast();
  const [f, setF] = useState({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (initial?._id) await apiPut(`/users/me/addresses/${initial._id}`, f);
      else await apiPost('/users/me/addresses', f);
      toast.success(initial?._id ? 'آدرس به‌روزرسانی شد' : 'آدرس ثبت شد');
      onDone?.();
    } catch (err: any) {
      toast.error((err as any).message || 'ثبت آدرس ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">نام و نام خانوادگی گیرنده *</label>
          <input required value={f.fullName} onChange={set('fullName')} className="input" />
        </div>
        <div>
          <label className="label">شماره تماس *</label>
          <input required value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="09xxxxxxxxx" className="input num" />
        </div>
        <div>
          <label className="label">استان *</label>
          <select required value={f.province} onChange={set('province')} className="select">
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">شهر *</label>
          <input required value={f.city} onChange={set('city')} className="input" />
        </div>
      </div>

      <div>
        <label className="label">نشانی کامل *</label>
        <textarea required value={f.address} onChange={set('address')} className="textarea" placeholder="خیابان، کوچه، پلاک، واحد" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">کد پستی</label>
          <input value={f.postalCode} onChange={set('postalCode')} inputMode="numeric" maxLength={10} className="input num" />
        </div>
        <div>
          <label className="label">برچسب</label>
          <select value={f.label} onChange={set('label')} className="select">
            <option>خانه</option><option>محل کار</option><option>سایر</option>
          </select>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-200">
        <input type="checkbox" checked={f.isDefault} onChange={set('isDefault')} className="checkbox" />
        این آدرس، آدرس پیش‌فرض من باشد
      </label>

      <div className="flex gap-2 pt-1">
        <button disabled={busy} className="btn-primary btn-sm">{busy ? 'در حال ذخیره…' : 'ذخیره‌ی آدرس'}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-ghost btn-sm">انصراف</button>}
      </div>
    </form>
  );
}

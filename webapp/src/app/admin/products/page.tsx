'use client';
import { useEffect, useState } from 'react';
import { mediaUrl, apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman, num } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import Drawer from '@/components/ui/Drawer';
import FileUpload from '@/components/FileUpload';
import { SkeletonLines } from '@/components/ui/Skeleton';

const EMPTY = {
  title: '', shortDescription: '', description: '', category: '', instrument: '',
  brand: '', maker: '', coverImage: '', gallery: [], price: 0, compareAtPrice: 0,
  stock: 0, weightGrams: 0, variants: [], specs: [], tags: [],
  isFeatured: false, isPublished: true,
};

const TABS = [
  { key: 'basic', label: 'اطلاعات پایه' },
  { key: 'media', label: 'تصاویر و ویدیو' },
  { key: 'price', label: 'قیمت و موجودی' },
  { key: 'specs', label: 'مشخصات و تنوع' },
];

export default function ManageProducts() {
  const toast = useToast();
  const [items, setItems] = useState<any>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [tab, setTab] = useState('basic');
  const [q, setQ] = useState('');

  const load = () => apiGet('/products/admin-all').then((data) => setItems(data)).catch(() => setItems([]));

  useEffect(() => {
    load();
    apiGet('/categories').then((data) => setCats(data)).catch(() => {});
    apiGet('/instruments').then((data) => setInstruments(data)).catch(() => {});
  }, []);

  const open = (p) => {
    setEdit(p ? { ...p, category: p.category?._id || p.category, instrument: p.instrument?._id || p.instrument || '' } : { ...EMPTY });
    setTab('basic');
  };

  const save = async () => {
    if (!edit.title || !edit.category) return toast.error('عنوان و دسته‌بندی الزامی است');
    const body = { ...edit, instrument: edit.instrument || null, tags: Array.isArray(edit.tags) ? edit.tags : String(edit.tags).split('،').map((s) => s.trim()).filter(Boolean) };
    try {
      if (edit._id) await apiPut(`/admin/products/${edit._id}`, body);
      else await apiPost('/admin/products', body);
      toast.success(edit._id ? 'محصول به‌روزرسانی شد' : 'محصول ساخته شد');
      setEdit(null);
      load();
    } catch (e: any) { toast.error((e as any).message || 'ذخیره ناموفق بود'); }
  };

  const del = async (p) => {
    if (!confirm(`«${p.title}» حذف شود؟`)) return;
    await apiDelete(`/admin/products/${p._id}`);
    toast.success('حذف شد');
    load();
  };

  const set = (k, v) => setEdit((s) => ({ ...s, [k]: v }));

  if (items === null) return <SkeletonLines count={6} />;

  const list = q ? items.filter((p) => p.title.includes(q) || p.brand?.includes(q)) : items;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-2xl">محصولات</h1>
          <p className="num text-sm text-ink-400">{num(items.length)} محصول</p>
        </div>
        <div className="flex flex-1 justify-end gap-2">
          <div className="relative w-full max-w-xs">
            <Icon name="search" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو…" className="input pr-10 py-2.5 text-[13px]" />
          </div>
          <button onClick={() => open(null)} className="btn-primary btn-sm shrink-0">
            <Icon name="plus" size={15} /> محصول جدید
          </button>
        </div>
      </header>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>محصول</th><th>دسته</th><th>قیمت</th><th>موجودی</th><th>فروش</th><th>وضعیت</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                      {p.coverImage && <img src={mediaUrl(p.coverImage)} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="clamp-1 max-w-[220px] text-[13px] text-ink-50">{p.title}</p>
                      <p className="text-[11px] text-ink-500">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="text-[12px] text-ink-300">{p.category?.name || '—'}</td>
                <td className="num text-[13px]">{toman(p.price)}</td>
                <td>
                  <span className={`num badge ${p.stock === 0 ? 'bg-danger/15 text-danger ring-1 ring-inset ring-danger/25' : p.stock <= 3 ? 'bg-zaferan-400/12 text-zaferan-300 ring-1 ring-inset ring-zaferan-400/25' : 'bg-ink-700/60 text-ink-200'}`}>
                    {num(p.stock)}
                  </span>
                </td>
                <td className="num text-[13px] text-ink-300">{num(p.soldCount)}</td>
                <td className="space-x-1 space-x-reverse">
                  {p.isFeatured && <span className="badge-paid">ویژه</span>}
                  {!p.isPublished && <span className="badge-neutral">پیش‌نویس</span>}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => open(p)} className="btn-ghost btn-sm btn-icon"><Icon name="edit" size={15} /></button>
                    <button onClick={() => del(p)} className="btn-ghost btn-sm btn-icon text-ink-500 hover:text-danger"><Icon name="trash" size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="py-12 text-center text-sm text-ink-500">محصولی یافت نشد.</p>}
      </div>

      {/* فرم محصول */}
      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?._id ? 'ویرایش محصول' : 'محصول جدید'}
        width="max-w-2xl"
        footer={<button onClick={save} className="btn-primary w-full">ذخیره‌ی محصول</button>}
      >
        {edit && (
          <div>
            <div className="mb-5 flex gap-1 border-b border-ink-800">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative px-3.5 py-2.5 text-[13px] transition-colors ${tab === t.key ? 'font-medium text-firooze-300' : 'text-ink-400 hover:text-ink-100'}`}
                >
                  {t.label}
                  {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-firooze-400" />}
                </button>
              ))}
            </div>

            {tab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="label">عنوان محصول *</label>
                  <input value={edit.title} onChange={(e) => set('title', e.target.value)} className="input" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">دسته‌بندی *</label>
                    <select value={edit.category} onChange={(e) => set('category', e.target.value)} className="select">
                      <option value="">— انتخاب کنید —</option>
                      {cats.map((c) => <option key={c._id} value={c._id}>{c.parent ? '— ' : ''}{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">ساز مرتبط (اختیاری)</label>
                    <select value={edit.instrument || ''} onChange={(e) => set('instrument', e.target.value)} className="select">
                      <option value="">— بدون ارتباط —</option>
                      {instruments.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">برند / کارگاه</label>
                    <input value={edit.brand} onChange={(e) => set('brand', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">نام سازنده</label>
                    <input value={edit.maker} onChange={(e) => set('maker', e.target.value)} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">توضیح کوتاه (زیر عنوان محصول)</label>
                  <textarea value={edit.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className="textarea min-h-[70px]" />
                </div>
                <div>
                  <label className="label">توضیحات کامل</label>
                  <textarea value={edit.description} onChange={(e) => set('description', e.target.value)} className="textarea min-h-[160px]" />
                </div>
                <div>
                  <label className="label">برچسب‌ها (با ، جدا کنید)</label>
                  <input
                    value={Array.isArray(edit.tags) ? edit.tags.join('، ') : edit.tags}
                    onChange={(e) => set('tags', e.target.value)}
                    className="input" placeholder="سه‌تار، دست‌ساز، توت"
                  />
                </div>
                <div className="flex flex-wrap gap-5 pt-1">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-200">
                    <input type="checkbox" checked={edit.isPublished} onChange={(e) => set('isPublished', e.target.checked)} className="checkbox" /> منتشر شده
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-200">
                    <input type="checkbox" checked={edit.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="checkbox" /> محصول ویژه
                  </label>
                </div>
              </div>
            )}

            {tab === 'media' && (
              <div className="space-y-5">
                <div>
                  <label className="label">تصویر اصلی</label>
                  <div className="flex items-center gap-3">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-ink-750 bg-ink-800">
                      {edit.coverImage ? <img src={mediaUrl(edit.coverImage)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink-600"><Icon name="image" size={20} /></div>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <FileUpload accept="image/*" value={edit.coverImage} onUploaded={(url) => set('coverImage', url)} />
                      <input value={edit.coverImage} onChange={(e) => set('coverImage', e.target.value)} className="input py-2 text-[11px]" placeholder="یا آدرس تصویر را بچسبانید" dir="ltr" />
                    </div>
                  </div>
                </div>

                <div className="divider" />

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="label mb-0">گالری (تصویر و ویدیو)</label>
                    <div className="flex gap-1.5">
                      <button onClick={() => set('gallery', [...edit.gallery, { url: '', type: 'image', alt: '' }])} className="btn-outline btn-sm text-[11px]">
                        <Icon name="image" size={13} /> تصویر
                      </button>
                      <button onClick={() => set('gallery', [...edit.gallery, { url: '', type: 'video', poster: '', alt: '' }])} className="btn-outline btn-sm text-[11px]">
                        <Icon name="video" size={13} /> ویدیو
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {edit.gallery.map((m, i) => (
                      <div key={i} className="rounded-xl border border-ink-800 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Icon name={m.type === 'video' ? 'video' : 'image'} size={15} className="text-firooze-400" />
                          <span className="text-[12px] text-ink-300">{m.type === 'video' ? 'ویدیو' : 'تصویر'} {(i + 1).toLocaleString('fa-IR')}</span>
                          <button
                            onClick={() => set('gallery', edit.gallery.filter((_, j) => j !== i))}
                            className="mr-auto text-ink-500 hover:text-danger"
                          ><Icon name="trash" size={14} /></button>
                        </div>
                        <div className="space-y-2">
                          <FileUpload
                            accept={m.type === 'video' ? 'video/*' : 'image/*'}
                            value={m.url}
                            onUploaded={(url) => set('gallery', edit.gallery.map((x, j) => (j === i ? { ...x, url } : x)))}
                          />
                          <input
                            value={m.url}
                            onChange={(e) => set('gallery', edit.gallery.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                            className="input py-2 text-[11px]" placeholder="آدرس فایل" dir="ltr"
                          />
                          {m.type === 'video' && (
                            <input
                              value={m.poster || ''}
                              onChange={(e) => set('gallery', edit.gallery.map((x, j) => (j === i ? { ...x, poster: e.target.value } : x)))}
                              className="input py-2 text-[11px]" placeholder="آدرس کاور ویدیو" dir="ltr"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    {!edit.gallery.length && <p className="py-6 text-center text-[12px] text-ink-500">هنوز رسانه‌ای اضافه نشده.</p>}
                  </div>
                </div>
              </div>
            )}

            {tab === 'price' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">قیمت (تومان) *</label>
                  <input type="number" value={edit.price} onChange={(e) => set('price', Number(e.target.value))} className="input num" />
                </div>
                <div>
                  <label className="label">قیمت قبل از تخفیف</label>
                  <input type="number" value={edit.compareAtPrice} onChange={(e) => set('compareAtPrice', Number(e.target.value))} className="input num" />
                  <p className="hint">اگر بیشتر از قیمت باشد، برچسب تخفیف نمایش داده می‌شود.</p>
                </div>
                <div>
                  <label className="label">موجودی انبار</label>
                  <input type="number" value={edit.stock} onChange={(e) => set('stock', Number(e.target.value))} className="input num" />
                  <p className="hint">اگر تنوع تعریف کنید، موجودی هر تنوع ملاک است.</p>
                </div>
                <div>
                  <label className="label">وزن (گرم)</label>
                  <input type="number" value={edit.weightGrams} onChange={(e) => set('weightGrams', Number(e.target.value))} className="input num" />
                  <p className="hint">برای محاسبه‌ی هزینه‌ی ارسال.</p>
                </div>
              </div>
            )}

            {tab === 'specs' && (
              <div className="space-y-7">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="label mb-0">مشخصات فنی</label>
                    <button onClick={() => set('specs', [...edit.specs, { key: '', value: '' }])} className="btn-outline btn-sm text-[11px]">
                      <Icon name="plus" size={13} /> افزودن
                    </button>
                  </div>
                  <div className="space-y-2">
                    {edit.specs.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={s.key} onChange={(e) => set('specs', edit.specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} placeholder="مثلاً جنس کاسه" className="input py-2.5 text-[12px]" />
                        <input value={s.value} onChange={(e) => set('specs', edit.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="مثلاً توت یک‌تکه" className="input py-2.5 text-[12px]" />
                        <button onClick={() => set('specs', edit.specs.filter((_, j) => j !== i))} className="btn-ghost btn-sm btn-icon shrink-0 text-ink-500 hover:text-danger"><Icon name="trash" size={14} /></button>
                      </div>
                    ))}
                    {!edit.specs.length && <p className="py-4 text-center text-[12px] text-ink-500">مشخصاتی اضافه نشده.</p>}
                  </div>
                </div>

                <div className="divider" />

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="label mb-0">تنوع محصول</label>
                    <button onClick={() => set('variants', [...edit.variants, { name: '', priceDiff: 0, stock: 0 }])} className="btn-outline btn-sm text-[11px]">
                      <Icon name="plus" size={13} /> افزودن
                    </button>
                  </div>
                  <div className="space-y-3">
                    {edit.variants.map((v, i) => (
                      <div key={i} className="rounded-xl border border-ink-800 p-3">
                        <div className="mb-2 flex gap-2">
                          <input value={v.name} onChange={(e) => set('variants', edit.variants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="نام تنوع" className="input py-2.5 text-[12px]" />
                          <button onClick={() => set('variants', edit.variants.filter((_, j) => j !== i))} className="btn-ghost btn-sm btn-icon shrink-0 text-ink-500 hover:text-danger"><Icon name="trash" size={14} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="mb-1 block text-[11px] text-ink-400">اختلاف قیمت</span>
                            <input type="number" value={v.priceDiff} onChange={(e) => set('variants', edit.variants.map((x, j) => (j === i ? { ...x, priceDiff: Number(e.target.value) } : x)))} className="input num py-2.5 text-[12px]" />
                          </div>
                          <div>
                            <span className="mb-1 block text-[11px] text-ink-400">موجودی</span>
                            <input type="number" value={v.stock} onChange={(e) => set('variants', edit.variants.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))} className="input num py-2.5 text-[12px]" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!edit.variants.length && <p className="py-4 text-center text-[12px] text-ink-500">تنوعی تعریف نشده (اختیاری).</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

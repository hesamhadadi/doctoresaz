'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { num } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import Drawer from '@/components/ui/Drawer';
import { SkeletonLines } from '@/components/ui/Skeleton';

const ICONS = ['package', 'music', 'tool', 'book', 'headphones', 'layers', 'file', 'award'];
const EMPTY = { name: '', description: '', icon: 'package', parent: '', order: 0, isPublished: true };

export default function ManageCategories() {
  const toast = useToast();
  const [tree, setTree] = useState<any>(null);
  const [flat, setFlat] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);

  const load = () => {
    apiGet('/categories?tree=1').then((data) => setTree(data)).catch(() => setTree([]));
    apiGet('/categories').then((data) => setFlat(data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const body = { ...edit, parent: edit.parent || null };
    try {
      if (edit._id) await apiPut(`/categories/${edit._id}`, body);
      else await apiPost('/categories', body);
      toast.success(edit._id ? 'دسته‌بندی به‌روزرسانی شد' : 'دسته‌بندی ساخته شد');
      setEdit(null);
      load();
    } catch (e: any) { toast.error((e as any).message || 'ذخیره ناموفق بود'); }
  };

  const del = async (c) => {
    if (!confirm(`«${c.name}» حذف شود؟`)) return;
    try {
      await apiDelete(`/categories/${c._id}`);
      toast.success('حذف شد');
      load();
    } catch (e: any) { toast.error((e as any).message || 'حذف ناموفق بود'); }
  };

  if (tree === null) return <SkeletonLines count={5} />;

  const Row = ({ c, child }: any) => (
    <div className={`flex items-center gap-3 rounded-xl border border-ink-800 p-3.5 ${child ? 'mr-6 bg-ink-900/40' : 'bg-ink-850/50'}`}>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${child ? 'bg-ink-800 text-ink-400' : 'bg-firooze-500/12 text-firooze-300'}`}>
        <Icon name={c.icon || 'package'} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink-50">{c.name}</p>
        <p className="num text-[11px] text-ink-500">{c.slug} · {num(c.productCount || 0)} محصول</p>
      </div>
      {!c.isPublished && <span className="badge-neutral">پیش‌نویس</span>}
      <button onClick={() => setEdit({ ...c, parent: c.parent || '' })} className="btn-ghost btn-sm btn-icon"><Icon name="edit" size={15} /></button>
      <button onClick={() => del(c)} className="btn-ghost btn-sm btn-icon text-ink-500 hover:text-danger"><Icon name="trash" size={15} /></button>
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-2xl">دسته‌بندی‌ها</h1>
          <p className="text-sm text-ink-400">ساختار دو سطحی: دسته‌ی اصلی و زیردسته</p>
        </div>
        <button onClick={() => setEdit({ ...EMPTY })} className="btn-primary btn-sm">
          <Icon name="plus" size={15} /> دسته‌ی جدید
        </button>
      </header>

      <div className="space-y-3">
        {tree.map((c) => (
          <div key={c._id} className="space-y-2">
            <Row c={c} />
            {c.children?.map((k) => <Row key={k._id} c={k} child />)}
          </div>
        ))}
        {!tree.length && <p className="py-12 text-center text-sm text-ink-500">هنوز دسته‌بندی‌ای نساخته‌اید.</p>}
      </div>

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?._id ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
        footer={<button onClick={save} className="btn-primary w-full">ذخیره</button>}
      >
        {edit && (
          <div className="space-y-4">
            <div>
              <label className="label">نام دسته *</label>
              <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">توضیح کوتاه</label>
              <textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="textarea" />
            </div>
            <div>
              <label className="label">دسته‌ی والد</label>
              <select value={edit.parent || ''} onChange={(e) => setEdit({ ...edit, parent: e.target.value })} className="select">
                <option value="">— دسته‌ی اصلی —</option>
                {flat.filter((c) => !c.parent && c._id !== edit._id).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">آیکون</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setEdit({ ...edit, icon: ic })}
                    className={`grid h-11 w-11 place-items-center rounded-xl border transition-colors ${
                      edit.icon === ic ? 'border-firooze-500 bg-firooze-500/10 text-firooze-300' : 'border-ink-700 text-ink-400 hover:border-ink-500'
                    }`}
                  >
                    <Icon name={ic} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">ترتیب نمایش</label>
              <input type="number" value={edit.order} onChange={(e) => setEdit({ ...edit, order: Number(e.target.value) })} className="input num" />
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-200">
              <input type="checkbox" checked={edit.isPublished} onChange={(e) => setEdit({ ...edit, isPublished: e.target.checked })} className="checkbox" />
              منتشر شده
            </label>
          </div>
        )}
      </Drawer>
    </div>
  );
}

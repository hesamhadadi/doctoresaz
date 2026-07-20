'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';

const blank = { name: '', description: '', coverImage: '', order: 0, isPublished: true };

export default function ManageInstruments() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(blank);

  const load = () => apiGet('/instruments').then((data) => setItems(data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (it) => { setEditing(it); setForm({ ...blank, ...it }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await apiPut(`/admin/instruments/${editing._id}`, form);
      else await apiPost('/admin/instruments', form);
      setOpen(false);
      load();
    } catch (err: any) {
      alert((err as any).message || 'خطا');
    }
  };

  const remove = async (it) => {
    if (!confirm(`حذف «${it.name}»؟`)) return;
    await apiDelete(`/admin/instruments/${it._id}`);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink-100">مدیریت سازها</h1>
        <button onClick={openNew} className="btn-primary">+ ساز جدید</button>
      </div>

      <div className="grid gap-3">
        {items.map((it) => (
          <div key={it._id} className="card flex items-center justify-between p-4">
            <div>
              <h3 className="font-bold text-ink-100">{it.name}</h3>
              <p className="text-xs text-ink-400">{it.slug}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(it)} className="btn-outline px-3 py-1.5 text-sm">ویرایش</button>
              <button onClick={() => remove(it)} className="btn-outline px-3 py-1.5 text-sm text-red-300">حذف</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? 'ویرایش ساز' : 'ساز جدید'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">نام ساز</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">توضیحات</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <FileUpload label="تصویر کاور" accept="image/*" value={form.coverImage} onUploaded={(url) => setForm({ ...form, coverImage: url })} />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="label">ترتیب نمایش</label>
              <input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm text-ink-100">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              منتشر شود
            </label>
          </div>
          <button className="btn-primary w-full">ذخیره</button>
        </form>
      </Modal>
    </div>
  );
}

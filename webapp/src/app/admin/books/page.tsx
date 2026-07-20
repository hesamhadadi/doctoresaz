'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman } from '@/lib/format';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';

const blank = { instrument: '', title: '', description: '', coverImage: '', author: '', price: 0, order: 0, isPublished: true };

export default function ManageBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(blank);

  const load = () =>
    Promise.all([apiGet('/books'), apiGet('/instruments')]).then(([b, i]) => {
      setBooks(b.data);
      setInstruments(i.data);
    });
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...blank, instrument: instruments[0]?._id || '' }); setOpen(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({ ...blank, ...b, instrument: b.instrument?._id || b.instrument });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await apiPut(`/admin/books/${editing._id}`, form);
      else await apiPost('/admin/books', form);
      setOpen(false);
      load();
    } catch (err: any) {
      alert((err as any).message || 'خطا');
    }
  };

  const remove = async (b) => {
    if (!confirm(`حذف «${b.title}» و همه قطعاتش؟`)) return;
    await apiDelete(`/admin/books/${b._id}`);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink-100">مدیریت کتاب‌ها</h1>
        <button onClick={openNew} className="btn-primary">+ کتاب جدید</button>
      </div>

      <div className="grid gap-3">
        {books.map((b) => (
          <div key={b._id} className="card flex items-center justify-between p-4">
            <div>
              <h3 className="font-bold text-ink-100">{b.title}</h3>
              <p className="text-xs text-ink-400">
                {b.instrument?.name} · {toman(b.price)} · مدرس {b.author}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(b)} className="btn-outline px-3 py-1.5 text-sm">ویرایش</button>
              <button onClick={() => remove(b)} className="btn-outline px-3 py-1.5 text-sm text-red-300">حذف</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? 'ویرایش کتاب' : 'کتاب جدید'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">ساز</label>
            <select className="input" value={form.instrument} onChange={(e) => setForm({ ...form, instrument: e.target.value })} required>
              <option value="">— انتخاب ساز —</option>
              {instruments.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">عنوان کتاب</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">توضیحات</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">مدرس</label>
              <input className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="حامد حدادی" />
            </div>
            <div>
              <label className="label">قیمت کل کتاب (تومان)</label>
              <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <FileUpload label="تصویر کاور" accept="image/*" value={form.coverImage} onUploaded={(url) => setForm({ ...form, coverImage: url })} />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="label">ترتیب</label>
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

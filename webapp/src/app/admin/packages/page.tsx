'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman } from '@/lib/format';
import Modal from '@/components/Modal';

const blank = { title: '', description: '', scope: 'instrument', instrument: '', book: '', price: 0, isPublished: true };

export default function ManagePackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(blank);

  const load = () =>
    Promise.all([apiGet('/packages'), apiGet('/instruments'), apiGet('/books')]).then(
      ([p, i, b]) => {
        setPackages(p.data);
        setInstruments(i.data);
        setBooks(b.data);
      }
    );
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      ...blank,
      ...pkg,
      instrument: pkg.instrument?._id || '',
      book: pkg.book?._id || '',
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await apiPut(`/admin/packages/${editing._id}`, form);
      else await apiPost('/admin/packages', form);
      setOpen(false);
      load();
    } catch (err: any) {
      alert((err as any).message || 'خطا');
    }
  };

  const remove = async (pkg) => {
    if (!confirm(`حذف «${pkg.title}»؟`)) return;
    await apiDelete(`/admin/packages/${pkg._id}`);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink-100">مدیریت پکیج‌ها</h1>
        <button onClick={openNew} className="btn-primary">+ پکیج جدید</button>
      </div>

      <div className="grid gap-3">
        {packages.map((pkg) => (
          <div key={pkg._id} className="card flex items-center justify-between p-4">
            <div>
              <h3 className="font-bold text-ink-100">{pkg.title}</h3>
              <p className="text-xs text-ink-400">
                {pkg.scope === 'instrument' ? `کل ساز: ${pkg.instrument?.name || '—'}` : `کل کتاب: ${pkg.book?.title || '—'}`} · {toman(pkg.price)}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(pkg)} className="btn-outline px-3 py-1.5 text-sm">ویرایش</button>
              <button onClick={() => remove(pkg)} className="btn-outline px-3 py-1.5 text-sm text-red-300">حذف</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? 'ویرایش پکیج' : 'پکیج جدید'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">عنوان پکیج</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">توضیحات</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">نوع پکیج</label>
            <select className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
              <option value="instrument">کل یک ساز</option>
              <option value="book">کل یک کتاب</option>
            </select>
          </div>
          {form.scope === 'instrument' ? (
            <div>
              <label className="label">ساز</label>
              <select className="input" value={form.instrument} onChange={(e) => setForm({ ...form, instrument: e.target.value })} required>
                <option value="">— انتخاب —</option>
                {instruments.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">کتاب</label>
              <select className="input" value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })} required>
                <option value="">— انتخاب —</option>
                {books.map((b) => <option key={b._id} value={b._id}>{b.instrument?.name} — {b.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">قیمت (تومان)</label>
            <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          </div>
          <button className="btn-primary w-full">ذخیره</button>
        </form>
      </Modal>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { toman } from '@/lib/format';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';

const emptyAsset = (free) => ({ url: '', isFree: free });
const blank = {
  title: '',
  description: '',
  order: 1,
  price: 50000,
  author: '',
  introVideo: emptyAsset(true),
  pdf: emptyAsset(true),
  lessonVideo: emptyAsset(false),
  audioGuide: emptyAsset(false),
};

// One row: upload + free/paid toggle for a single asset.
function AssetField({ label, icon, accept, kind, value, onChange }: any) {
  return (
    <div className="rounded-xl border border-ink-750 bg-ink-900/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-ink-100">{icon} {label}</span>
        <label className="flex items-center gap-1.5 text-xs text-firooze-200">
          <input
            type="checkbox"
            checked={value.isFree}
            onChange={(e) => onChange({ ...value, isFree: e.target.checked })}
          />
          رایگان
        </label>
      </div>
      <FileUpload accept={accept} value={value.url} onUploaded={(url) => onChange({ ...value, url })} />
      {value.url && <p className="mt-1 truncate text-[11px] text-ink-400">{value.url}</p>}
      <input
        className="input mt-2 text-xs"
        placeholder="یا لینک مستقیم فایل"
        value={value.url}
        onChange={(e) => onChange({ ...value, url: e.target.value })}
      />
      <span className="mt-1 block text-[11px] text-ink-400">نوع: {kind}</span>
    </div>
  );
}

export default function ManagePieces() {
  const [books, setBooks] = useState<any[]>([]);
  const [bookId, setBookId] = useState('');
  const [pieces, setPieces] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(blank);

  useEffect(() => {
    apiGet('/books').then((data) => {
      setBooks(data);
      if (data[0]) setBookId(data[0]._id);
    });
  }, []);

  const loadPieces = (id) => id && apiGet(`/admin/pieces/book/${id}`).then((data) => setPieces(data));
  useEffect(() => { loadPieces(bookId); }, [bookId]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...blank, order: pieces.length + 1 });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...blank,
      ...p,
      introVideo: p.introVideo || emptyAsset(true),
      pdf: p.pdf || emptyAsset(true),
      lessonVideo: p.lessonVideo || emptyAsset(false),
      audioGuide: p.audioGuide || emptyAsset(false),
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await apiPut(`/admin/pieces/${editing._id}`, form);
      else await apiPost('/admin/pieces', { ...form, book: bookId });
      setOpen(false);
      loadPieces(bookId);
    } catch (err: any) {
      alert((err as any).message || 'خطا');
    }
  };

  const remove = async (p) => {
    if (!confirm(`حذف «${p.title}»؟`)) return;
    await apiDelete(`/admin/pieces/${p._id}`);
    loadPieces(bookId);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink-100">مدیریت قطعات</h1>
        <div className="flex items-center gap-2">
          <select className="input w-56" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            {books.map((b) => (
              <option key={b._id} value={b._id}>{b.instrument?.name} — {b.title}</option>
            ))}
          </select>
          <button onClick={openNew} disabled={!bookId} className="btn-primary whitespace-nowrap">+ قطعه</button>
        </div>
      </div>

      <div className="grid gap-3">
        {pieces.map((p) => (
          <div key={p._id} className="card flex items-center justify-between p-4">
            <div>
              <h3 className="font-bold text-ink-100">#{p.order} — {p.title}</h3>
              <p className="text-xs text-ink-400">
                {toman(p.price)} · معرفی {p.introVideo?.isFree ? 'رایگان' : 'پولی'} · آموزش{' '}
                {p.lessonVideo?.isFree ? 'رایگان' : 'پولی'}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="btn-outline px-3 py-1.5 text-sm">ویرایش</button>
              <button onClick={() => remove(p)} className="btn-outline px-3 py-1.5 text-sm text-red-300">حذف</button>
            </div>
          </div>
        ))}
        {pieces.length === 0 && <p className="text-ink-400">برای این کتاب قطعه‌ای ثبت نشده است.</p>}
      </div>

      <Modal open={open} wide title={editing ? 'ویرایش قطعه' : 'قطعه جدید'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="label">عنوان قطعه</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">ترتیب</label>
              <input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
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
              <label className="label">قیمت تک‌قطعه (تومان)</label>
              <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AssetField label="ویدیو معرفی قطعه" icon="🎬" accept="video/*" kind="video"
              value={form.introVideo} onChange={(v) => setForm({ ...form, introVideo: v })} />
            <AssetField label="نت قطعه (PDF)" icon="📄" accept="application/pdf" kind="pdf"
              value={form.pdf} onChange={(v) => setForm({ ...form, pdf: v })} />
            <AssetField label="ویدیو آموزش نواختن" icon="🎥" accept="video/*" kind="video"
              value={form.lessonVideo} onChange={(v) => setForm({ ...form, lessonVideo: v })} />
            <AssetField label="فایل صوتی راهنما" icon="🎵" accept="audio/*" kind="audio"
              value={form.audioGuide} onChange={(v) => setForm({ ...form, audioGuide: v })} />
          </div>

          <button className="btn-primary w-full">ذخیره قطعه</button>
        </form>
      </Modal>
    </div>
  );
}

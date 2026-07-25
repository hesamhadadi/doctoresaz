'use client';
import { useState } from 'react';
import { mediaUrl } from '@/lib/client';
import { apiPost } from '@/lib/client';

// آپلود فایل: تصاویر کوچک به‌صورت data URI ذخیره می‌شوند (بدون نیاز به دیسک، مناسب serverless).
// برای ویدیو/فایل بزرگ، آدرس (URL) را در فیلد کناری بچسبانید.
export default function FileUpload({ label, accept, value, onUploaded }: { label?: string; accept?: string; value?: string; onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) { alert('حجم تصویر باید کمتر از ۸۰۰ کیلوبایت باشد. برای فایل بزرگ‌تر، آدرس آن را بچسبانید.'); return; }
    setBusy(true);
    try {
      const reader = new FileReader();
      reader.onload = () => { onUploaded(String(reader.result)); setBusy(false); };
      reader.onerror = () => { alert('خطا در خواندن فایل'); setBusy(false); };
      reader.readAsDataURL(file);
    } catch { setBusy(false); }
  };
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-2">
        <label className="btn-outline btn-sm cursor-pointer">
          {busy ? 'در حال بارگذاری…' : '📤 انتخاب تصویر'}
          <input type="file" accept={accept} onChange={handle} className="hidden" disabled={busy} />
        </label>
        {value && <span className="text-xs text-firooze-300">✓ انتخاب شد</span>}
      </div>
    </div>
  );
}

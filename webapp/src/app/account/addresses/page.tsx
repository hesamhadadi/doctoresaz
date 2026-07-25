'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client';
import { useToast } from '@/context/ToastContext';
import Icon from '@/components/ui/Icon';
import Empty from '@/components/ui/Empty';
import AddressForm from '@/components/AddressForm';

export default function Addresses() {
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null); // آبجکت آدرس یا 'new'

  const load = () => apiGet('/users/me/addresses').then((data) => setList(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('این آدرس حذف شود؟')) return;
    await apiDelete(`/users/me/addresses/${id}`);
    toast.success('آدرس حذف شد');
    load();
  };

  const setDefault = async (a) => {
    await apiPut(`/users/me/addresses/${a._id}`, { ...a, isDefault: true });
    load();
  };

  return (
    <div>
      <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-2xl">آدرس‌های من</h1>
          <p className="text-sm text-ink-400">آدرس‌های ذخیره‌شده برای تحویل سفارش</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')} className="btn-primary btn-sm">
            <Icon name="plus" size={15} /> آدرس جدید
          </button>
        )}
      </header>

      {editing && (
        <div className="card mb-6 p-5">
          <h3 className="mb-4 text-base">{editing === 'new' ? 'افزودن آدرس' : 'ویرایش آدرس'}</h3>
          <AddressForm
            initial={editing === 'new' ? null : editing}
            onDone={() => { setEditing(null); load(); }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {!list.length && !editing ? (
        <Empty icon="map" title="آدرسی ثبت نشده" description="برای خرید محصولات فیزیکی، حداقل یک آدرس لازم است." />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {list.map((a) => (
            <div key={a._id} className={`card p-4 ${a.isDefault ? 'ring-1 ring-firooze-500/30' : ''}`}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="badge-neutral">{a.label}</span>
                {a.isDefault && <span className="badge-free">پیش‌فرض</span>}
              </div>
              <p className="mb-1 text-[13px] font-medium text-ink-50">{a.fullName}</p>
              <p className="mb-1 text-[13px] leading-7 text-ink-300">{a.province}، {a.city} — {a.address}</p>
              <p className="num mb-4 text-[11px] text-ink-500">
                {a.phone}{a.postalCode && ` · کدپستی ${a.postalCode}`}
              </p>

              <div className="flex gap-1.5">
                <button onClick={() => setEditing(a)} className="btn-ghost btn-sm text-xs">
                  <Icon name="edit" size={13} /> ویرایش
                </button>
                {!a.isDefault && (
                  <button onClick={() => setDefault(a)} className="btn-ghost btn-sm text-xs text-firooze-300">پیش‌فرض کن</button>
                )}
                <button onClick={() => del(a._id)} className="btn-ghost btn-sm mr-auto text-xs text-ink-400 hover:text-danger">
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/client';
import { num } from '@/lib/format';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/Icon';
import Drawer from '@/components/ui/Drawer';
import Empty from '@/components/ui/Empty';
import Pagination from '@/components/ui/Pagination';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { SkeletonGrid } from '@/components/ui/Skeleton';

const SORTS = [
  { key: 'newest', label: 'جدیدترین' }, { key: 'popular', label: 'پرفروش‌ترین' },
  { key: 'cheap', label: 'ارزان‌ترین' }, { key: 'expensive', label: 'گران‌ترین' }, { key: 'rating', label: 'بالاترین امتیاز' },
];

function ShopInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [cats, setCats] = useState<any[]>([]);
  const [data, setData] = useState<any>({ items: [], total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const inStock = params.get('inStock') === '1';
  const [minP, setMinP] = useState(params.get('min') || '');
  const [maxP, setMaxP] = useState(params.get('max') || '');

  useEffect(() => { apiGet('/categories?tree=1').then(setCats).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    apiGet(`/products?${params.toString()}&limit=12`).then(setData).catch(() => setData({ items: [], total: 0, page: 1, pages: 0 })).finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [params]);

  const patch = (obj: Record<string, any>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(obj).forEach(([k, v]) => { if (v === '' || v == null || v === false) next.delete(k); else next.set(k, String(v)); });
    if (!('page' in obj)) next.delete('page');
    router.push(`/shop?${next.toString()}`);
  };

  const activeCat = useMemo(() => {
    for (const c of cats) { if (c.slug === category) return c; const k = c.children?.find((x: any) => x.slug === category); if (k) return k; }
    return null;
  }, [cats, category]);
  const activeCount = [q, category, params.get('min'), params.get('max'), inStock ? '1' : ''].filter(Boolean).length;

  const Filters = () => (
    <div className="space-y-7">
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100"><Icon name="grid" size={15} className="text-firooze-400" /> دسته‌بندی</h4>
        <ul className="space-y-1">
          <li><button onClick={() => patch({ category: '' })} className={`w-full rounded-lg px-3 py-2 text-right text-[13px] transition-colors ${!category ? 'bg-firooze-500/12 text-firooze-300' : 'text-ink-300 hover:bg-ink-800'}`}>همه‌ی محصولات</button></li>
          {cats.map((c) => (
            <li key={c._id}>
              <button onClick={() => patch({ category: c.slug })} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-[13px] font-medium transition-colors ${category === c.slug ? 'bg-firooze-500/12 text-firooze-300' : 'text-ink-200 hover:bg-ink-800'}`}>
                {c.name}<span className="num text-[10px] text-ink-500">{num(c.totalCount ?? c.productCount)}</span>
              </button>
              <ul className="mr-3 mt-0.5 space-y-0.5 border-r border-ink-800 pr-2">
                {c.children?.map((k: any) => (
                  <li key={k._id}><button onClick={() => patch({ category: k.slug })} className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-right text-[12px] transition-colors ${category === k.slug ? 'text-firooze-300' : 'text-ink-400 hover:text-ink-100'}`}>{k.name}<span className="num text-[10px] text-ink-600">{num(k.productCount)}</span></button></li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="divider" />
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100"><Icon name="tag" size={15} className="text-firooze-400" /> محدوده‌ی قیمت</h4>
        <div className="flex items-center gap-2">
          <input value={minP} onChange={(e) => setMinP(e.target.value.replace(/\D/g, ''))} placeholder="از" inputMode="numeric" className="input num py-2.5 text-xs" />
          <span className="text-ink-600">—</span>
          <input value={maxP} onChange={(e) => setMaxP(e.target.value.replace(/\D/g, ''))} placeholder="تا" inputMode="numeric" className="input num py-2.5 text-xs" />
        </div>
        <button onClick={() => patch({ min: minP, max: maxP })} className="btn-outline btn-sm mt-2.5 w-full">اعمال قیمت</button>
      </div>
      <div className="divider" />
      <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-200"><input type="checkbox" checked={inStock} onChange={(e) => patch({ inStock: e.target.checked ? '1' : '' })} className="checkbox" /> فقط کالاهای موجود</label>
      {activeCount > 0 && <button onClick={() => router.push('/shop')} className="btn-ghost btn-sm w-full text-danger"><Icon name="close" size={14} /> حذف همه‌ی فیلترها</button>}
    </div>
  );

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ href: '/shop', label: 'فروشگاه' } as any, ...(activeCat ? [{ label: activeCat.name }] : [])]} />
      <header className="mb-8">
        <h1 className="mb-2">{activeCat?.name || (q ? `جستجو: ${q}` : 'فروشگاه دکتر ساز')}</h1>
        <p className="text-sm text-ink-400">{activeCat?.description || 'سازهای دست‌ساز، لوازم جانبی و منابع آموزشی — مستقیم از کارگاه‌های معتبر.'}</p>
      </header>
      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block"><div className="sticky top-24"><Filters /></div></aside>
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button onClick={() => setFilterOpen(true)} className="btn-outline btn-sm lg:hidden"><Icon name="filter" size={15} /> فیلترها{activeCount > 0 && <span className="num badge bg-firooze-500 px-1.5 text-ink-950">{num(activeCount)}</span>}</button>
            <span className="num text-xs text-ink-400">{num(data.total)} محصول</span>
            <div className="no-bar mr-auto flex gap-1.5 overflow-x-auto">
              {SORTS.map((s) => <button key={s.key} onClick={() => patch({ sort: s.key })} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs transition-colors ${sort === s.key ? 'bg-ink-800 font-medium text-firooze-300' : 'text-ink-400 hover:text-ink-100'}`}>{s.label}</button>)}
            </div>
          </div>
          {loading ? <SkeletonGrid count={9} /> : !data.items.length ? (
            <Empty icon="search" title="محصولی پیدا نشد" description="فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید." action="مشاهده‌ی همه" href="/shop" />
          ) : (
            <>
              <div className="stagger grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">{data.items.map((p: any) => <ProductCard key={p._id} product={p} />)}</div>
              <Pagination page={data.page} pages={data.pages} onChange={(p: number) => patch({ page: p })} />
            </>
          )}
        </div>
      </div>
      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="فیلترها" width="max-w-sm"><Filters /></Drawer>
    </div>
  );
}

export default function ShopPage() {
  return <Suspense fallback={<div className="container py-20"><SkeletonGrid count={9} /></div>}><ShopInner /></Suspense>;
}

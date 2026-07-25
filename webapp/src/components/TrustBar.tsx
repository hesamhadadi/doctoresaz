'use client';
import Icon from '@/components/ui/Icon';

const ITEMS = [
  { icon: 'shield', title: 'ضمانت اصالت کالا', desc: 'مستقیم از کارگاه' },
  { icon: 'truck', title: 'ارسال سراسری', desc: 'بالای ۱۵ میلیون رایگان' },
  { icon: 'refresh', title: '۷ روز ضمانت بازگشت', desc: 'بدون قید و شرط' },
  { icon: 'headphones', title: 'پشتیبانی تخصصی', desc: 'مشاوره قبل از خرید' },
];

export default function TrustBar() {
  return (
    <div className="container">
      <div className="grid grid-cols-2 gap-y-5 rounded-xl border border-ink-750 bg-ink-850 px-4 py-5 lg:grid-cols-4">
        {ITEMS.map((t) => (
          <div key={t.title} className="flex flex-col items-center gap-2 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-900 text-firooze-600">
              <Icon name={t.icon} size={20} />
            </span>
            <div>
              <p className="text-[12px] text-ink-100" style={{ fontWeight: 500 }}>{t.title}</p>
              <p className="mt-0.5 text-[10px] text-ink-400">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

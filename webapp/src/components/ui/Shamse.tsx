'use client';
// شمسه — ستاره‌ی هشت‌پرِ هندسی ایرانی. به‌عنوان واترمارک و جداکننده استفاده می‌شود.
export function Shamse({ className = '', size = 200, opacity = 0.06 }: any) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} style={{ opacity }} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="42" y="42" width="116" height="116" />
        <rect x="42" y="42" width="116" height="116" transform="rotate(45 100 100)" />
        <rect x="60" y="60" width="80" height="80" transform="rotate(22.5 100 100)" />
        <rect x="60" y="60" width="80" height="80" transform="rotate(67.5 100 100)" />
        <circle cx="100" cy="100" r="82" />
        <circle cx="100" cy="100" r="26" />
      </g>
    </svg>
  );
}

// خط جداکننده با شمسه در وسط
export function ShamseDivider({ className = '' }: any) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-ink-700" />
      <Shamse size={26} opacity={0.5} className="text-firooze-500" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-ink-700" />
    </div>
  );
}

// تارهای ساز — خطوط عمودی متحرک، موتیف موسیقایی سایت
export function Strings({ count = 5, className = '' }: any) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="w-[2px] animate-string rounded-full bg-current"
          style={{ height: 18, animationDelay: `${i * 0.13}s`, animationDuration: `${1.1 + (i % 3) * 0.25}s` }}
        />
      ))}
    </div>
  );
}

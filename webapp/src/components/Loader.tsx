'use client';
export default function Loader({ label = 'در حال بارگذاری...' }: any) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-firooze-200">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-750 border-t-firooze-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

'use client';
import Icon from './Icon';

export default function QtyStepper({ value, onChange, max = 99, min = 1, disabled = false }: any) {
  const set = (v) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="inline-flex items-center rounded-xl border border-ink-700 bg-ink-900">
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={disabled || value >= max}
        aria-label="افزایش تعداد"
        className="grid h-11 w-11 place-items-center rounded-r-xl text-ink-200 transition-colors hover:bg-ink-800 hover:text-firooze-300 disabled:opacity-35"
      >
        <Icon name="plus" size={16} />
      </button>
      <span className="num w-10 select-none text-center text-sm font-semibold text-ink-50">
        {value.toLocaleString('fa-IR')}
      </span>
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={disabled || value <= min}
        aria-label="کاهش تعداد"
        className="grid h-11 w-11 place-items-center rounded-l-xl text-ink-200 transition-colors hover:bg-ink-800 hover:text-firooze-300 disabled:opacity-35"
      >
        <Icon name="minus" size={16} />
      </button>
    </div>
  );
}

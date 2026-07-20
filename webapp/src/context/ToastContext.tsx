'use client';
import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import Icon from '@/components/ui/Icon';

type Tone = 'success' | 'error' | 'info';
const ToastContext = createContext<any>(null);
export const useToast = () => useContext(ToastContext);
const TONES: Record<Tone, { icon: string; cls: string }> = {
  success: { icon: 'checkCircle', cls: 'border-firooze-500/40 text-firooze-200' },
  error: { icon: 'alert', cls: 'border-danger/40 text-red-200' },
  info: { icon: 'info', cls: 'border-ink-600 text-ink-100' },
};
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: string; message: string; tone: Tone }[]>([]);
  const push = useCallback((message: string, tone: Tone = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, message, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4000);
  }, []);
  const toast = { success: (m: string) => push(m, 'success'), error: (m: string) => push(m, 'error'), info: (m: string) => push(m, 'info') };
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-5 z-[100] flex flex-col gap-2.5">
        {items.map((t) => { const tone = TONES[t.tone]; return (
          <div key={t.id} role="status" className={`pointer-events-auto flex animate-scale-in items-center gap-3 rounded-xl border bg-ink-900/95 px-4 py-3 text-sm shadow-lift backdrop-blur-xl ${tone.cls}`}>
            <Icon name={tone.icon} size={18} /><span>{t.message}</span>
          </div>); })}
      </div>
    </ToastContext.Provider>
  );
}

'use client';
export default function Modal({ open, title, onClose, children, wide }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className={`card my-8 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-100">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-firooze-400">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

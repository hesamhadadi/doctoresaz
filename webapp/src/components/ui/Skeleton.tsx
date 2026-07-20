'use client';
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton ratio-saz w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-2/5" />
        <div className="skeleton h-5 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: any) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonLines({ count = 4 }: any) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full" />
      ))}
    </div>
  );
}

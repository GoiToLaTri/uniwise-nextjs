// Skeleton component cho loading state
export function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] md:p-10">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        <div className="h-32 w-32 animate-pulse rounded-2xl bg-slate-200 md:h-40 md:w-40" />
        <div className="flex-1 space-y-5 self-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-12 w-64 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-11 w-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-11 w-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * Layout chung cho các section
 * @param param0 
 * @returns 
 */
export function SharedPlaceholder({ title, isAdmin }: { title: string; isAdmin?: boolean }) {
  return (
    <div className={cn(
      "flex min-h-[420px] w-full flex-col items-center justify-center rounded-[2.5rem] p-12 text-center transition-all",
      "bg-white shadow-[0_32px_64px_-16px_rgba(79,70,229,0.12)] border border-slate-100",
      isAdmin && "bg-linear-to-br from-slate-900 to-indigo-950 border-none text-white shadow-indigo-900/20"
    )}>
      <div className={cn("mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50", isAdmin && "bg-white/10")}>
        <div className="h-10 w-10 rounded-xl rotate-12 bg-linear-to-br from-indigo-600 to-purple-500 shadow-lg shadow-indigo-200" />
      </div>
      <h3 className={cn("max-w-2xl text-4xl font-black tracking-tight leading-[1.1]", isAdmin ? "text-white" : "text-slate-900")}>
        {title}
      </h3>
      <div className="mt-8 flex items-center gap-4 text-slate-400">
        <div className="h-[1px] w-8 bg-current opacity-20" />
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em]">Sub Component</p>
        <div className="h-[1px] w-8 bg-current opacity-20" />
      </div>
    </div>
  );
}
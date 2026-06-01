import { LucideIcon } from "lucide-react";

interface PartnerCategoryProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PartnerCategory({ icon: Icon, title, description }: PartnerCategoryProps) {
  return (
    <div className="group p-8 rounded-[2rem] border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">
        {title}
      </h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
        {description}
      </p>
      <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
        Sắp ra mắt <span className="w-8 h-[2px] bg-slate-200 group-hover:bg-indigo-600 transition-all" />
      </button>
    </div>
  );
}
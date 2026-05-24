import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  isUp: boolean;
}

export function StatsCard({ label, value, icon: Icon, trend, isUp }: StatsCardProps) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
          <div className={cn(
            "flex items-center px-2 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
            isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
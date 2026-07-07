import { ArrowUpRight, Users, PlayCircle, Star, DollarSign, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Tổng doanh thu", value: "$12,850.00", icon: DollarSign, trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Học viên mới", value: "1,240", icon: Users, trend: "+18%", color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Khóa học hoạt động", value: "12", icon: PlayCircle, trend: "0%", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Đánh giá trung bình", value: "4.9", icon: Star, trend: "+0.2", color: "text-amber-500", bg: "bg-amber-50" },
];

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Chào buổi sáng
          </h1>
          <p className="text-slate-500 font-medium">Đây là những gì đang diễn ra với các khóa học của bạn hôm nay.</p>
        </div>
        <Button className="h-11 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200">
          Tạo khóa học mới
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 border-none shadow-[0_20px_50px_rgba(79,70,229,0.06)] bg-white/90 backdrop-blur-md rounded-xl group hover:shadow-indigo-100 transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="flex items-center gap-x-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                {stat.trend}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Chart & Secondary Section (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-8 border-none shadow-[0_20px_50px_rgba(79,70,229,0.06)] bg-white/90 backdrop-blur-md rounded-xl min-h-[400px] flex flex-col justify-center items-center text-slate-400 border-2 border-dashed border-slate-100">
          <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-bold">Biểu đồ tăng trưởng doanh thu (Chart Area)</p>
          <p className="text-sm">Tích hợp Recharts tại đây</p>
        </Card>

        <Card className="lg:col-span-4 p-8 border-none shadow-[0_20px_50px_rgba(79,70,229,0.06)] bg-white/90 backdrop-blur-md rounded-xl">
          <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Hoạt động gần đây</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-x-4 items-center animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Học viên mới đăng ký</p>
                  <p className="text-xs text-slate-400 font-medium">Khóa học: Next.js v15 Pro</p>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">2m ago</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
import { Banknote, Users, BookOpen, TrendingUp } from "lucide-react";
import { RecentSales } from "../_components/recent-sales";
import { StatsCard } from "../_components/stats-card";

const STATS_DATA = [
  { label: "Doanh thu", value: "128.4M", icon: Banknote, trend: "+12%", isUp: true },
  { label: "Học viên", value: "1.240", icon: Users, trend: "+18%", isUp: true },
  { label: "Khóa học", value: "48", icon: BookOpen, trend: "-2%", isUp: false },
  { label: "Tỷ lệ học", value: "78%", icon: TrendingUp, trend: "+4%", isUp: true },
];


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-500 font-medium">Báo cáo tình hình hoạt động của Uniwise hôm nay.</p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_DATA.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* 3. Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <RecentSales />
        </div>
        <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-100">
           <h3 className="text-xl font-black leading-tight">Uniwise Pro Plan <br/> đang hoạt động tốt!</h3>
           <p className="text-indigo-100 text-sm mt-4 font-medium">Hệ thống của bạn đã tự động tối ưu hóa 12% dung lượng lưu trữ video trong tháng này.</p>
           <button className="mt-8 bg-white text-indigo-600 font-black py-3 rounded-xl text-sm active:scale-95 transition-all">Nâng cấp ngay</button>
        </div>
      </div>
    </div>
  );
}
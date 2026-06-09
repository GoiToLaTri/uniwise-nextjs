"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart3, MessageSquare, Settings, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/instructor" },
  { label: "Khóa học của tôi", icon: BookOpen, href: "/instructor/courses" },
  { label: "Phân tích & Doanh thu", icon: BarChart3, href: "/instructor/analytics" },
  { label: "Đánh giá", icon: MessageSquare, href: "/instructor/reviews" },
  { label: "Cài đặt", icon: Settings, href: "/instructor/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 flex items-center gap-x-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-r from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-slate-900">
          UNIWISE<span className="text-indigo-600">.</span>
        </span>
      </div>

      <div className="flex flex-col w-full px-4 gap-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 mb-2">
          Menu Quản trị
        </p>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-3 text-slate-500 font-bold px-4 py-3 rounded-xl transition-all active:scale-95 group",
              pathname === route.href ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-100 hover:text-slate-700"
            )}
          >
            <route.icon className={cn("w-5 h-5", pathname === route.href ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
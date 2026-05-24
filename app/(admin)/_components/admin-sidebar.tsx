"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, Users, BarChart3, 
  Settings, GraduationCap, ChevronRight, Loader2, 
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile"; // Hook của bạn
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // Sử dụng Skeleton của Shadcn

const routes = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
  { label: "Khóa học", icon: BookOpen, href: "/admin/courses" },
  { label: "Người dùng", icon: Users, href: "/admin/users" },
  { label: "Phân quyền", icon: ShieldCheck, href: "/admin/roles" },
  { label: "Doanh thu", icon: BarChart3, href: "/admin/analytics" },
  { label: "Cài đặt", icon: Settings, href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: profile, isLoading } = useProfile();

  // Tạo tên viết tắt cho Avatar Fallback
  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";
  };

  return (
    <div className="h-full border-r border-slate-200 bg-white flex flex-col">
      {/* 1. Header Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-100">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Uniwise</span>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Quản lý</p>
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all active:scale-95",
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
              )}
            >
              <div className="flex items-center gap-3">
                <route.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                {route.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* 3. User Profile Section (Bottom) */}
      <div className="p-4 border-t border-slate-100">
        {isLoading ? (
          // Trạng thái đang tải dữ liệu
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24 bg-slate-200" />
              <Skeleton className="h-2 w-32 bg-slate-200" />
            </div>
          </div>
        ) : profile ? (
          // Trạng thái đã có dữ liệu profile
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 group cursor-pointer hover:bg-indigo-50/50 transition-colors">
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm rounded-xl">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-linear-to-br from-indigo-600 to-blue-500 text-white text-[10px] font-black">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-black text-slate-900 truncate tracking-tight">
                {profile.name}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                {profile.email}
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
        ) : (
          // Fallback nếu lỗi hoặc không có profile
          <div className="p-4 text-center text-[10px] font-bold text-rose-500 bg-rose-50 rounded-xl uppercase tracking-widest">
            Session Expired
          </div>
        )}
      </div>
    </div>
  );
}
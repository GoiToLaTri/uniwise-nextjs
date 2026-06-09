"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, Users, BarChart3, 
  Settings, ShieldCheck, Key, GraduationCap, 
  ChevronRight, Home, LogOut, UserCircle2, ChevronsUpDown, 
  Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-auth";

const routes = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
  { label: "Khóa học", icon: BookOpen, href: "/admin/courses" },
  { label: "Người dùng", icon: Users, href: "/admin/users" },
  { label: "Giảng viên", icon: GraduationCap, href: "/admin/instructors" },
  { label: "Vai trò", icon: ShieldCheck, href: "/admin/roles" },
  { label: "Quyền hạn", icon: Key, href: "/admin/permissions" },
  { label: "Mức giá", icon: Banknote , href: "/admin/price-tiers" },
  { label: "Doanh thu", icon: BarChart3, href: "/admin/analytics" },
  { label: "Cài đặt", icon: Settings, href: "/admin/settings" },
];

export function AdminSidebar() {
  const {mutate: logout, isPending} = useLogout()
  const pathname = usePathname();
  const { data: profile, isLoading } = useProfile();

  const handleLogout = () => {
    logout()
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";
  };

  return (
    <div className="h-full border-r border-slate-200 bg-white flex flex-col">
      {/* 1. Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-100">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Uniwise</span>
      </div>

      {/* 2. Menu Section */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Hệ thống</p>
        {routes.map((route) => {
          const isActive = route.href === "/admin" 
          ? pathname === "/admin" 
          : pathname.startsWith(route.href);
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

      {/* 3. User Profile with Dropdown Menu */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {isLoading ? (
          <div className="rounded-2xl p-4 flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl bg-slate-200" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20 bg-slate-200" />
              <Skeleton className="h-2 w-28 bg-slate-200" />
            </div>
          </div>
        ) : profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-all group active:scale-95">
                <Avatar className="h-9 w-9 border border-slate-100 rounded-xl">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="bg-linear-to-br from-indigo-600 to-blue-500 text-white text-[10px] font-black uppercase">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden flex-1 text-left">
                  <p className="text-xs font-black text-slate-900 truncate tracking-tight">
                    {profile.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase truncate tracking-tighter">
                    {profile.email}
                  </p>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              side="top" 
              align="start" 
              sideOffset={12}
              className="w-64 rounded-2xl p-2 border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-white animate-in slide-in-from-bottom-2"
            >
              <DropdownMenuLabel className="px-3 py-2">
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Quyền quản trị</span>
                    <span className="text-xs font-bold text-slate-500">Mã: {profile.publicId}</span>
                 </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              
              <Link href="/">
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer group">
                  <Home className="w-4 h-4 mr-3 text-slate-400 group-focus:text-indigo-600" />
                  Về trang chủ
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem className="rounded-xl px-3 py-2.5 font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer group">
                <UserCircle2 className="w-4 h-4 mr-3 text-slate-400 group-focus:text-indigo-600" />
                Hồ sơ cá nhân
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl px-3 py-2.5 font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer group"
              >
                <LogOut className="w-4 h-4 mr-3 text-rose-400 group-focus:text-rose-600" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}
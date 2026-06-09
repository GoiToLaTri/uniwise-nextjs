"use client";

import { 
  Bell, 
  Search, 
  User, 
  Home, 
  LogOut, 
  Settings, 
  ChevronDown 
} from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";

// Function thường lấy chữ cái đầu
function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map(function(n) { return n[0]; })
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  // Hook lấy dữ liệu profile
  const { data: profile, isPending } = useProfile();

  return (
    <nav className="h-20 px-6 lg:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <Input 
            placeholder="Tìm kiếm dữ liệu khóa học..." 
            className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0 rounded-xl font-medium"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-x-3 ml-auto">
        
        {/* Bell Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-xl hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all active:scale-95"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.577_0.245_27.325)] border-2 border-white"></span>
          </span>
        </Button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        {isPending ? (
          <div className="flex items-center gap-x-3 px-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="hidden sm:block space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-x-3 px-2 h-12 rounded-xl hover:bg-slate-50 transition-all outline-none focus:ring-0 active:scale-95 group"
              >
                <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-sm ring-0 group-hover:ring-4 group-hover:ring-indigo-500/10 transition-all">
                  <AvatarImage src={profile?.avatarUrl || ""} alt={profile?.name} />
                  <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-black text-xs">
                    {getInitials(profile?.name || "User")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none tracking-tight">
                    {profile?.name}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 mt-1">
                    {profile?.profileType || "Instructor"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              className="w-64 p-2 rounded-xl border-slate-200 bg-white shadow-[0_20px_50px_rgba(79,70,229,0.15)] animate-in fade-in slide-in-from-top-2 duration-200" 
              align="end" 
              sideOffset={12}
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black text-slate-900 tracking-tight">{profile?.name}</p>
                  <p className="text-xs font-medium text-slate-500 leading-none truncate">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-slate-100 mx-1" />
              
              <DropdownMenuGroup className="p-1 space-y-1">
                {/* 
                   Sửa lỗi Hover: Sử dụng data-[highlighted] của Radix UI 
                   kết hợp với asChild để thẻ Link bao trọn vùng tương tác
                */}
                <DropdownMenuItem asChild className="focus:bg-indigo-50 data-[highlighted]:bg-indigo-50 outline-none rounded-lg transition-colors group">
                  <Link href="/" className="flex w-full items-center gap-x-3 p-2.5 cursor-pointer">
                    <Home className="w-4 h-4 text-slate-400 group-data-[highlighted]:text-indigo-600 transition-colors" />
                    <span className="font-bold text-slate-600 group-data-[highlighted]:text-indigo-600">Về trang chủ</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="focus:bg-indigo-50 data-[highlighted]:bg-indigo-50 outline-none rounded-lg transition-colors group">
                  <Link href="/instructor/profile" className="flex w-full items-center gap-x-3 p-2.5 cursor-pointer">
                    <User className="w-4 h-4 text-slate-400 group-data-[highlighted]:text-indigo-600 transition-colors" />
                    <span className="font-bold text-slate-600 group-data-[highlighted]:text-indigo-600">Trang cá nhân</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="focus:bg-indigo-50 data-[highlighted]:bg-indigo-50 outline-none rounded-lg transition-colors group">
                  <Link href="/instructor/settings" className="flex w-full items-center gap-x-3 p-2.5 cursor-pointer">
                    <Settings className="w-4 h-4 text-slate-400 group-data-[highlighted]:text-indigo-600 transition-colors" />
                    <span className="font-bold text-slate-600 group-data-[highlighted]:text-indigo-600">Cài đặt tài khoản</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-slate-100 mx-1" />

              <DropdownMenuItem 
                className="flex items-center gap-x-3 p-2.5 m-1 rounded-lg font-bold text-[oklch(0.577_0.245_27.325)] cursor-pointer outline-none focus:bg-red-50 data-[highlighted]:bg-red-50 transition-colors active:scale-[0.98] group"
                onClick={function() { console.log("Logout:", profile?.id); }}
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
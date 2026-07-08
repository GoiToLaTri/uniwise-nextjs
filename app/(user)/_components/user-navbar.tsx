"use client";

import Link from "next/link";
import { GraduationCap, Search, Bell, Loader2 } from "lucide-react";
import { UserAccountDialog } from "@/app/(marketing)/_components/user-account-dialog";
import { useProfile } from "@/hooks/use-profile";

export function UserNavbar() {
  const { data, isLoading } = useProfile();

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="hidden sm:block text-xl font-black tracking-tighter bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            UNIWISE
          </span>
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium sm:text-sm"
              placeholder="Tìm kiếm khóa học, bài giảng..."
            />
          </div>
        </div>

        {/* Right: Notifications & User */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Search Icon (only visible on small screens) */}
          <button className="md:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Notification Icon */}
          <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
            <Bell className="w-5 h-5" />
            {/* Notification Badge Example */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
          </button>

          {/* User Account Dialog */}
          <div className="pl-2 border-l border-slate-200">
            {isLoading ? (
              <div className="h-10 w-10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              </div>
            ) : data ? (
              <UserAccountDialog user={data} />
            ) : (
              // Fallback if not logged in but inside user layout (should technically not happen due to route guard)
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
            )}
          </div>
        </div>
        
      </div>
    </nav>
  );
}

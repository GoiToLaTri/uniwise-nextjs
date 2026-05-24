"use client";

import { Bell, Search, Menu, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminNavbar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Mobile Menu Trigger */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="w-5 h-5 text-slate-600" />
      </Button>

      {/* Search Bar */}
      <div className="hidden md:flex relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Tìm kiếm khóa học, học viên..." 
          className="pl-10 bg-slate-50 border-none rounded-xl h-10 focus-visible:ring-1 focus-visible:ring-indigo-500/20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </Button>
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        <Button variant="ghost" className="font-bold text-slate-600 gap-2 px-2">
          <UserCircle className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Hệ thống</span>
        </Button>
      </div>
    </header>
  );
}
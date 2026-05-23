"use client";

import Link from "next/link";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAccountDialog } from "./user-account-dialog"; // Import Dialog vừa tạo
import { useProfile } from "@/hooks/use-profile";

export function Navbar() {
  const { data, isLoading } = useProfile();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Uniwise */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            UNIWISE
          </span>
        </Link>

        {/* Menu Items */}
        <div className="hidden md:flex items-center gap-8">
          {["Khóa học", "Lộ trình", "Giảng viên", "Cộng đồng"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right Section: Auth State */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          ) : data ? (
            // NẾU ĐÃ ĐĂNG NHẬP: Hiện Dialog Thông tin
            <div className="flex items-center gap-3">
               <span className="hidden sm:block text-sm font-bold text-slate-700">Hi, {data.name.split(' ').pop()}</span>
               <UserAccountDialog user={data} />
            </div>
          ) : (
            // NẾU CHƯA ĐĂNG NHẬP: Hiện Signin/Signup
            <div className="flex items-center gap-2">
              <Link href="/signin">
                <Button variant="ghost" className="font-bold rounded-xl h-11 text-slate-600 hover:text-indigo-600">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 active:scale-95 transition-all shadow-lg shadow-indigo-200">
                  Bắt đầu
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
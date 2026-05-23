"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            UNIWISE
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Khóa học", "Lộ trình", "Giảng viên", "Cộng đồng"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href={"/signin"}>
            <Button variant="ghost" className="font-bold rounded-xl h-11">
              Đăng nhập
            </Button>
          </Link>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 active:scale-95 transition-all shadow-lg shadow-indigo-200">
            Bắt đầu học
          </Button>
        </div>
      </div>
    </nav>
  );
}

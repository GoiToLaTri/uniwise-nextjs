"use client";

import { 
  User, 
  Mail, 
  Fingerprint, 
  LogOut, 
  BookOpen, 
  Settings, 
  Shield, 
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Thêm Description để fix triệt để lỗi a11y
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  accountId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  publicId: string;
}

export function UserAccountDialog({ user }: { user: UserProfile }) {
  const router = useRouter();
  
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("uniwise_token");
    toast.success("Đã đăng xuất khỏi Uniwise");
    router.refresh();
    router.push("/");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-slate-100 ring-offset-2 hover:ring-indigo-500 transition-all active:scale-90 shadow-sm outline-hidden">
          <Avatar className="h-full w-full">
            <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
            <AvatarFallback className="bg-linear-to-br from-indigo-600 to-blue-500 text-white font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[1.25rem] shadow-[0_20px_50px_rgba(79,70,229,0.2)] bg-white outline-hidden" showCloseButton={false}>
        {/* Fix Accessibility: Tiêu đề và Mô tả ẩn cho Screen Reader */}
        <DialogHeader className="sr-only">
          <DialogTitle>Thông tin tài khoản {user.name}</DialogTitle>
          <DialogDescription>
            Xem chi tiết hồ sơ cá nhân và quản lý các thiết lập tài khoản Uniwise của bạn.
          </DialogDescription>
        </DialogHeader>

        {/* Nút Close Custom */}
        <div className="h-32 bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500 relative">
          <DialogClose className="absolute right-4 top-4 rounded-full p-2 bg-white/20 hover:bg-white/40 text-white transition-colors outline-hidden focus:ring-2 focus:ring-white/50">
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="px-8 pb-8">
          {/* Nội dung Visual vẫn giữ nguyên */}
          <div className="relative -mt-16 mb-6 flex flex-col items-center">
            <Avatar className="h-32 w-32 border-[6px] border-white shadow-xl rounded-[2rem]">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="text-3xl font-black bg-slate-100 text-indigo-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">{user.name}</h2>
            <p className="text-slate-500 font-medium">{user.email}</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Fingerprint className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Public ID</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-600">{user.publicId}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tài khoản</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Verified Member</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
                <BookOpen className="mr-2 h-4 w-4 text-indigo-600" />
                Khóa học
              </Button>
              <Button variant="outline" className="h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
                <Settings className="mr-2 h-4 w-4 text-slate-600" />
                Cài đặt
              </Button>
            </div>

            <Button 
              onClick={handleLogout}
              className="w-full h-12 bg-slate-900 hover:bg-red-600 text-white font-black rounded-xl active:scale-95 transition-all shadow-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ĐĂNG XUẤT KHỎI HỆ THỐNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
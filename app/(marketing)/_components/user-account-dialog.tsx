"use client";

import { 
  User, 
  Mail, 
  Fingerprint, 
  LogOut, 
  BookOpen, 
  Settings, 
  Shield, 
  X,
  Loader2,
  LayoutDashboard,
  Presentation
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
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getTokenResponse } from "@/stores/token-store";
import { useState, useEffect } from "react";

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
  const {mutate: logout, isPending} = useLogout()
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingToken, setLoadingToken] = useState(true);

  // 1. Lấy và phân tách Scope từ Token
  useEffect(() => {
    async function fetchRoles() {
      try {
        const tokenData = await getTokenResponse();
        if (tokenData?.scope) {
          // Chuyển chuỗi "ROLE_USER ROLE_ADMIN" -> ["ROLE_USER", "ROLE_ADMIN"]
          const roleArray = tokenData.scope.split(" ");
          setRoles(roleArray);
        }
      } catch (error) {
        console.error("Lỗi lấy token:", error);
      } finally {
        setLoadingToken(false);
      }
    }
    fetchRoles();
  }, []);

  const isAdmin = roles.includes("ROLE_ADMIN");
  const isInstructor = roles.includes("ROLE_INSTRUCTOR");

  // 2. Cấu hình Action Button dựa trên Role cao nhất
  const getRoleAction = () => {
    if (isAdmin) {
      return {
        label: "Quản trị hệ thống",
        icon: LayoutDashboard,
        href: "/admin",
        color: "text-rose-600",
        bgColor: "hover:bg-rose-50",
        badge: "Administrator"
      };
    }
    if (isInstructor) {
      return {
        label: "Quản lý giảng dạy",
        icon: Presentation,
        href: "/instructor/portal",
        color: "text-amber-600",
        bgColor: "hover:bg-amber-50",
        badge: "Instructor"
      };
    }
    return {
      label: "Khóa học của tôi",
      icon: BookOpen,
      href: "/my-courses",
      color: "text-indigo-600",
      bgColor: "hover:bg-indigo-50",
      badge: "Student"
    };
  };

  const action = getRoleAction();
  const ActionIcon = action.icon;
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout()
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-slate-100 ring-offset-2 hover:ring-indigo-500 transition-all active:scale-90 shadow-sm outline-hidden cursor-pointer group">
          <Avatar className="h-full w-full">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="bg-linear-to-br from-indigo-600 to-blue-500 text-white font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[1.25rem] shadow-[0_20px_50px_rgba(79,70,229,0.2)] bg-white outline-hidden [&>button]:text-white [&>button]:z-50">
        <DialogHeader className="sr-only">
          <DialogTitle>Tài khoản Uniwise</DialogTitle>
          <DialogDescription>Thông tin chi tiết và quyền hạn người dùng</DialogDescription>
        </DialogHeader>

        {/* Hero Section */}
        <div className="h-32 bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500" />

        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col items-center">
            <Avatar className="h-32 w-32 border-[6px] border-white shadow-xl rounded-[2.5rem]">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="text-3xl font-black bg-slate-50 text-indigo-600">{initials}</AvatarFallback>
            </Avatar>
            <div className="mt-4 flex items-center gap-2">
               <h2 className="text-2xl font-black tracking-tight text-slate-900">{user.name}</h2>
               {isAdmin && <Shield className="w-5 h-5 text-rose-500" fill="currentColor" fillOpacity={0.1} />}
            </div>
            <p className="text-slate-500 font-medium">{user.email}</p>
          </div>

          <div className="space-y-6">
            {/* Box thông tin */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public ID</span>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100">{user.publicId}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vai trò</span>
                {loadingToken ? (
                  <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                ) : (
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                    isAdmin ? "bg-rose-100 text-rose-700" : isInstructor ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                  )}>
                    {action.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href={action.href} className="w-full">
                <Button 
                  variant="outline" 
                  disabled={loadingToken}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold border-slate-200 active:scale-95 transition-all group",
                    action.bgColor
                  )}
                >
                  {loadingToken ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ActionIcon className={cn("mr-2 h-4 w-4 transition-transform group-hover:rotate-12", action.color)} />
                      <span className="truncate">{action.label}</span>
                    </>
                  )}
                </Button>
              </Link>

              <Button variant="outline" className="h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
                <Settings className="mr-2 h-4 w-4 text-slate-600" />
                Cài đặt
              </Button>
            </div>

            <Button 
              onClick={handleLogout}
              className="w-full h-12 bg-slate-950 hover:bg-red-600 text-white font-black rounded-xl active:scale-95 transition-all shadow-xl shadow-slate-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ?"Đang đăng xuất":" ĐĂNG XUẤT HỆ THỐNG"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
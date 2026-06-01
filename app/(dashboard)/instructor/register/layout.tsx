"use client";

import { useInstructorProfile } from "@/hooks/use-instructor";
import { ReactNode } from "react";
import { 
  GraduationCap, Loader2, CheckCircle2, Clock, 
  AlertCircle, ArrowRight, LayoutDashboard, 
  ShieldAlert, Mail, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  const { data: instructor, isLoading } = useInstructorProfile();

  // Component trang trí nền
  const BackgroundDecor = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 1. Subtle Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* 2. Large Ambient Glows (OKLCH) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <BackgroundDecor />
        <div className="relative">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white flex flex-col items-center gap-4">
             <div className="bg-indigo-600 p-3 rounded-2xl shadow-indigo-200 shadow-lg animate-bounce">
                <GraduationCap className="w-8 h-8 text-white" />
             </div>
             <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Uniwise Data</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (instructor) {
    const statusConfig = {
      PENDING: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-50", title: "Hồ sơ đang chờ duyệt", action: "Quay về trang chủ" },
      APPROVED: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-50", title: "Bạn đã là giảng viên", action: "Vào Dashboard" },
      REJECTED: { icon: AlertCircle, color: "text-destructive", bgColor: "bg-red-50", title: "Hồ sơ bị từ chối", action: "Liên hệ hỗ trợ" },
      INACTIVE: { icon: ShieldAlert, color: "text-slate-600", bgColor: "bg-slate-100", title: "Tài khoản tạm khóa", action: "Gửi Hỗ trợ" }
    };
    const config = statusConfig[instructor.status];
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        <BackgroundDecor />

        {/* Floating Accent Icons (Làm đầy không gian) */}
        <div className="absolute top-20 left-20 text-indigo-200/40 animate-in fade-in duration-1000 slide-in-from-top-10">
            <Sparkles className="w-12 h-12" />
        </div>
        <div className="absolute bottom-20 right-20 text-blue-200/40 animate-in fade-in duration-1000 slide-in-from-bottom-10">
            <GraduationCap className="w-16 h-16 rotate-12" />
        </div>

        <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_40px_100px_rgba(79,70,229,0.1)] rounded-[3rem] p-12 text-center relative overflow-hidden">
            
            {/* Header decor */}
            <div className="flex flex-col items-center mb-8">
                <div className={cn("p-5 rounded-[2rem] border-4 border-white shadow-xl mb-4", config.bgColor)}>
                    <StatusIcon className={cn("w-12 h-12", config.color)} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                    {config.title}
                </h2>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed mb-10 px-4">
              {instructor.status === "PENDING" && "Đội ngũ chuyên môn đang xem xét hồ sơ của bạn. Chúng tôi sẽ phản hồi sớm nhất qua email."}
              {instructor.status === "APPROVED" && "Tuyệt vời! Bạn hiện đã có toàn quyền truy cập vào hệ thống công cụ giảng dạy của Uniwise."}
              {instructor.status === "REJECTED" && (instructor.reviewComment || "Hồ sơ của bạn hiện chưa đáp ứng đủ tiêu chí. Vui lòng kiểm tra lại thông tin.")}
              {instructor.status === "INACTIVE" && "Tài khoản của bạn tạm thời không khả dụng. Vui lòng liên hệ quản trị viên để kích hoạt lại."}
            </p>

            <div className="space-y-4">
              {instructor.status === "APPROVED" ? (
                <Link href="/instructor/dashboard">
                  <Button className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 group transition-all">
                    Vào Dashboard giảng viên
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link href="/">
                  <Button className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group">
                    {config.action}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 opacity-40">
             <div className="h-[1px] w-12 bg-slate-300" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Uniwise Partners Program
             </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. TRẠNG THÁI CHƯA CÓ HỒ SƠ
  return (
    <div className="min-h-screen">
        <BackgroundDecor />
        {children}
    </div>
  );
}
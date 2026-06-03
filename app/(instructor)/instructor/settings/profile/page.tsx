"use client";

import { History, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useInstructorProfile } from "@/hooks/use-instructor";
import { InstructorUpdateForm } from "./_components/instructor-update-form";
import { UpdateInstructorFormValues } from "./_lib/update-schema";

export default function UpdateProfilePage() {
  const { data: profile, isLoading } = useInstructorProfile();

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) return <div>Không tìm thấy dữ liệu hồ sơ.</div>;

  // --- MAPPING DATA ĐỂ FIX LỖI TYPE ---
  const formInitialData: UpdateInstructorFormValues = {
    name: profile.name || "", // Fix null name từ API
    headline: profile.headline || "",
    biography: profile.biography || "",
    yearsOfExperience: profile.yearsOfExperience || 0,
    degrees: profile.degrees.map((d: any) => ({
      id: d.id,
      type: d.type,
      name: d.name,
      institution: d.institution,
      issuedDate: d.issuedDate,
      description: d.description || "",
    })),
    expertises: profile.expertises.map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description || "",
      level: e.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT", // Ép kiểu enum
    })),
  };

  const isRejected = profile.status === "REJECTED";

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12 animate-in fade-in duration-700">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <Link href="/instructor/dashboard">
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
             </Link>
             <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase">
                Cập nhật hồ sơ
             </h1>
             <Badge className={cn(
                "px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border shadow-none",
                isRejected ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
             )}>
                {profile.status}
             </Badge>
          </div>
          <p className="text-slate-500 font-medium italic pl-14">
            Chỉnh sửa thông tin để gửi xét duyệt lại cho hệ thống Uniwise.
          </p>
        </div>
      </div>

      {/* 2. Rejection Banner */}
      {isRejected && (
        <div className="relative bg-white/80 backdrop-blur-md border border-rose-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-start gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
             <ShieldAlert className="w-32 h-32 text-rose-600" />
          </div>
          
          <div className="h-14 w-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200 shrink-0 relative z-10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-4 flex-1 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-rose-600 uppercase tracking-tight">
                Phản hồi từ Ban quản trị
              </h3>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <History className="w-3 h-3 text-indigo-400" /> 
                {profile.rejectedAt ? new Date(profile.rejectedAt).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            
            <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100/50">
               <p className="text-slate-800 font-bold text-lg leading-relaxed">
                  "{profile.reviewComment || "Hồ sơ cần được cập nhật thêm thông tin chuyên môn."}"
               </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Form Section */}
      <div className="w-full bg-white rounded-[3rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 md:p-16">
          {/* TRUYỀN DỮ LIỆU ĐÃ MAPPED */}
          <InstructorUpdateForm initialData={formInitialData} />
      </div>

    </div>
  );
}
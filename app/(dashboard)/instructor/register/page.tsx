import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { InstructorProfileForm } from "./_components/instructor-profile-form";

export default function InstructorRegisterPage() {
  return (
    <div className="container relative mx-auto px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        {/* LEFT COLUMN: HERO INFO */}
        <div className="lg:col-span-5 lg:sticky lg:top-12 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
          {/* LOGO UNIWISE CỐ ĐỊNH BÊN TRÁI */}
      <div className="flex items-center gap-3 mb-16 animate-in fade-in slide-in-from-top-4 duration-700 group w-fit">
        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent uppercase">
          Uniwise
        </span>
      </div>
          <div className="space-y-6">
            <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 px-4 py-1 rounded-full font-bold tracking-[0.2em] uppercase text-[10px]">
              Instructor Partnership
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] text-slate-900">
              Lan tỏa tri thức cùng <br />
              <span className="bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Uniwise.
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-md leading-relaxed font-medium">
              Hệ thống quản lý giảng dạy chuyên nghiệp, giúp bạn tập trung hoàn toàn vào việc truyền tải kiến thức.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-slate-200 w-fit">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Bảo mật hồ sơ</p>
              <p className="text-xs text-slate-500 font-medium">Thông tin được xác thực bởi đội ngũ Uniwise</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE FORM CARD */}
        <div className="lg:col-span-7 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-500/5 rounded-[3rem] blur-3xl" />
            <div className="relative bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_20px_50px_rgba(79,70,229,0.08)] rounded-[2rem] overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="mb-10">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                    Hồ sơ chuyên gia
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium italic">
                    Thông tin này sẽ được dùng để giới thiệu bạn với học viên.
                  </p>
                </div>

                <InstructorProfileForm />
                
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
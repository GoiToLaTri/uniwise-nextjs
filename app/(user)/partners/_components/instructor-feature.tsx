import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, TrendingUp, Globe, ShieldCheck, ArrowRight } from "lucide-react";

export function InstructorFeature() {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
              Giảng dạy & Chuyên gia
            </span>
            <h2 className="text-5xl font-black tracking-tighter leading-tight text-slate-900">
              Biến kiến thức của bạn thành <br />
              <span className="bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Tài sản bền vững.
              </span>
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              Gia nhập cộng đồng chuyên gia tại Uniwise để tiếp cận hàng triệu học viên toàn cầu. Chúng tôi lo phần công nghệ, bạn chỉ cần tập trung vào giảng dạy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: TrendingUp, label: "Chia sẻ doanh thu đến 70%", desc: "Cơ chế minh bạch, hấp dẫn." },
              { icon: Globe, label: "Thị trường toàn cầu", desc: "Không giới hạn địa lý." },
              { icon: ShieldCheck, label: "Bảo hộ nội dung", desc: "Chống sao chép trái phép." },
              { icon: GraduationCap, label: "Hỗ trợ chuyên môn", desc: "Đội ngũ sản xuất đồng hành." },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-[11px] tracking-widest">
                  <item.icon className="w-4 h-4" /> {item.label}
                </div>
                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link href="/instructor/register">
              <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 group transition-all">
                Đăng ký trở thành giảng viên
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Decoration */}
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-3xl rotate-3" />
          <div className="relative aspect-square rounded-[2.5rem] bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center p-12">
            <GraduationCap className="w-40 h-40 text-indigo-500/20 absolute -top-10 -right-10 rotate-12" />
            <div className="text-center space-y-6">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Overview
               </div>
               <h3 className="text-3xl font-bold text-white tracking-tight">Hệ thống quản lý giảng dạy chuyên nghiệp nhất</h3>
               <div className="grid grid-cols-3 gap-4">
                  {[85, 92, 78].map((v, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                       <p className="text-2xl font-black text-white">{v}%</p>
                       <p className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">Efficiency</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
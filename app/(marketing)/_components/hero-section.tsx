import { Button } from "@/components/ui/button";
import { PlayCircle, Rocket } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-200/30 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Rocket className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">
            Nền tảng học tập thế hệ mới
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Nâng tầm sự nghiệp <br />
          <span className="bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            bằng kiến thức thực chiến
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Học từ các chuyên gia hàng đầu trong lĩnh vực Tech & Design. Hơn 500+
          khóa học chất lượng cao đang chờ đón bạn khám phá.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Button
            size="lg"
            className="h-14 px-8 rounded-xl bg-indigo-600 font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
          >
            Xem danh sách khóa học
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 rounded-xl border-slate-200 font-bold text-lg hover:bg-slate-50 active:scale-95 transition-all"
          >
            <PlayCircle className="mr-2 w-5 h-5 text-indigo-600" />
            Xem Demo
          </Button>
        </div>
      </div>
    </section>
  );
}

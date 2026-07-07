import Link from "next/link";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import { SignupForm } from "./_components";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* CỘT TRÁI: Marketing Visual (Tương đồng với Login nhưng đổi Content) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-700 via-indigo-600 to-purple-600" />

        <div className="relative z-10 p-12 text-white max-w-xl">
          <div className="mb-12 animate-in fade-in slide-in-from-left-8 duration-700">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white/20 p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform backdrop-blur-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                UNIWISE
              </span>
            </Link>
          </div>

          <h1 className="text-5xl font-black tracking-tighter leading-[1.1] mb-8 animate-in fade-in slide-in-from-left-10 duration-1000 delay-150">
            Bắt đầu hành trình tri thức của bạn.
          </h1>

          <ul className="space-y-4 animate-in fade-in slide-in-from-left-12 duration-1000 delay-300">
            {[
              "Truy cập hơn 500+ khóa học chuyên sâu",
              "Học hỏi từ các chuyên gia đầu ngành",
              "Chứng chỉ có giá trị quốc tế",
              "Cộng đồng hỗ trợ 24/7",
            ].map((benefit, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-indigo-100 font-medium"
              >
                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative Element */}
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      {/* CỘT PHẢI: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-120 animate-in fade-in zoom-in-95 duration-700">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}

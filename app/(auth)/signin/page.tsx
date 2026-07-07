import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "./_components";

export default function SigninPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* CỘT TRÁI: Brand Visual & Marketing (Ẩn trên mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 items-center justify-center overflow-hidden">
        {/* Background Patterns (Tailwind v4 syntax) */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-blue-700" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_70%)] from-white" />

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

          <h1 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6 animate-in fade-in slide-in-from-left-10 duration-1000 delay-150">
            Khai phá tiềm năng thực sự của bạn ngay hôm nay.
          </h1>
          <p className="text-indigo-100 text-lg font-medium animate-in fade-in slide-in-from-left-12 duration-1000 delay-300">
            Hàng ngàn khóa học chất lượng cao đang chờ đón bạn tại Uniwise. Hãy
            đăng nhập để tiếp tục hành trình học tập.
          </p>
        </div>

        {/* Decorative Circle */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* CỘT PHẢI: Login Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-110 animate-in fade-in zoom-in-95 duration-700">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

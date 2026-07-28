"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLogin } from "@/hooks/use-auth";
import { consumePendingAuthError } from "@/lib/auth-error";
import { toast } from "sonner";

// 1. Schema Validation với Zod
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải chứa ít nhất 8 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    const pendingMessage = consumePendingAuthError();
    if (pendingMessage) toast.error(pendingMessage);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data); // Gọi mutation khi submit form
  };

  return (
    <Card className="border-slate-200 shadow-[0_20px_50px_rgba(79,70,229,0.08)] bg-white/90 backdrop-blur-md rounded-xl">
      <CardHeader className="space-y-1 pb-8">
        <div className="lg:hidden mb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              UNIWISE
            </span>
          </Link>
        </div>
        <CardTitle className="text-3xl font-black tracking-tight">
          Chào mừng trở lại
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          Nhập thông tin để truy cập tài khoản Uniwise của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* Login with Google/Social */}
        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            className="h-11 rounded-xl font-bold border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
            type="button"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            Đăng nhập với Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400">
            <span className="bg-white px-2">Hoặc dùng Email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-bold text-xs uppercase tracking-widest text-slate-600"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                placeholder="name@example.com"
                tabIndex={1}
                className={cn(
                  "pl-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
                  errors.email &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-bold text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="font-bold text-xs uppercase tracking-widest text-slate-600"
              >
                Mật khẩu
              </Label>
              <Button
                tabIndex={3}
                variant="link"
                className="text-xs font-bold text-indigo-600 p-0 h-auto hover:no-underline"
              >
                Quên mật khẩu?
              </Button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                tabIndex={2}
                type={showPassword ? "text" : "password"}
                className={cn(
                  "pl-10 pr-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
                  errors.password &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                )}
                {...register("password")}
              />
              <button
                type="button"
                tabIndex={4}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-bold text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            tabIndex={5}
            className="w-full h-12 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-200 mt-2"
            disabled={isPending} // Disable khi đang call API
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ĐANG XỬ LÝ...
              </div>
            ) : (
              "ĐĂNG NHẬP NGAY"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-center gap-1 pb-8">
        <span className="text-sm text-slate-500 font-medium">
          Bạn chưa có tài khoản?
        </span>
        <Link href={"/signup"}>
          <Button
            variant="link"
            className="text-sm font-bold text-indigo-600 p-0 h-auto hover:no-underline"
          >
            Đăng ký miễn phí
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

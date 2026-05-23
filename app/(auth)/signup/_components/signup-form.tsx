"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from "lucide-react";

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
import { useSignup } from "@/hooks/use-auth";

// Schema Validation với Zod
const signupSchema = z.object({
  name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải chứa ít nhất 8 ký tự"),
  //   confirmPassword: z.string(),
});
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Mật khẩu xác nhận không khớp",
//     path: ["confirmPassword"],
//   });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { mutate: signup, isPending } = useSignup();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    signup(data);
  };

  return (
    <Card className="border-slate-200 shadow-[0_20px_50px_rgba(79,70,229,0.08)] bg-white/90 backdrop-blur-md rounded-xl">
      <CardHeader className="space-y-1 pb-6">
        <div className="lg:hidden flex items-center gap-2 mb-4">
          <div className="bg-indigo-600 p-1 rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-indigo-600">
            UNIWISE
          </span>
        </div>
        <CardTitle className="text-3xl font-black tracking-tight">
          Tạo tài khoản mới
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          Trở thành học viên của Uniwise ngay hôm nay
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        {/* Google Signup */}
        <Button
          variant="outline"
          className="h-11 rounded-xl font-bold border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
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
          Đăng ký với Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400">
            <span className="bg-white px-2">Hoặc điền thông tin</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
              Họ và tên
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Nguyễn Văn A"
                className={cn(
                  "pl-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30",
                  errors.name && "border-destructive",
                )}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs font-bold text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="name@example.com"
                className={cn(
                  "pl-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30",
                  errors.email && "border-destructive",
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-bold text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                className={cn(
                  "pl-10 pr-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30",
                  errors.password && "border-destructive",
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-bold text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                className={cn(
                  "pl-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30",
                  errors.confirmPassword && "border-destructive",
                )}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-bold text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div> */}

          <Button
            className="w-full h-12 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-200 mt-2"
            disabled={isPending}
          >
            {isPending ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN UNIWISE"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-center gap-1 pb-8">
        <span className="text-sm text-slate-500 font-medium">
          Đã có tài khoản?
        </span>
        <Link href="signin">
          <Button
            variant="link"
            className="text-sm font-bold text-indigo-600 p-0 h-auto hover:no-underline"
          >
            Đăng nhập
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

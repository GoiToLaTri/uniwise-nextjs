"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, AlertCircle, User, PencilLine, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateInstructorProfileSchema, type UpdateInstructorFormValues } from "../_lib/update-schema";

type StepOneValues = Pick<UpdateInstructorFormValues, "name" | "headline" | "biography" | "yearsOfExperience">;

export function BasicInfoUpdateForm({ onNext, initialData }: { onNext: (data: StepOneValues) => void, initialData: StepOneValues }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StepOneValues>({
    resolver: zodResolver(updateInstructorProfileSchema.pick({
      name: true,
      headline: true,
      biography: true,
      yearsOfExperience: true,
    })),
    defaultValues: initialData,
  });

  const bioContent = useWatch({ control, name: "biography" }) || "";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="grid grid-cols-1 gap-8">
        
        {/* 1. Tên Giảng Viên */}
        <div className="space-y-3">
          <Label htmlFor="name" className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.15em]">
            Họ và tên giảng viên <User className="w-3.5 h-3.5 text-indigo-400" />
          </Label>
          <Input
            id="name"
            placeholder="Nhập họ và tên đầy đủ của bạn..."
            className={cn(
              "h-14 rounded-2xl border-slate-200 bg-white shadow-sm transition-all font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
              errors.name && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
            )}
            {...register("name")}
          />
          {errors.name && (
            <div className="flex items-center gap-1.5 text-rose-500 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-tighter">{errors.name.message}</span>
            </div>
          )}
        </div>

        {/* 2. Headline */}
        <div className="space-y-3">
          <Label htmlFor="headline" className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.15em]">
            Tiêu đề chuyên môn <PencilLine className="w-3.5 h-3.5 text-indigo-400" />
          </Label>
          <Input
            id="headline"
            placeholder="Ví dụ: Chuyên gia thiết kế hệ thống tại Uniwise"
            className={cn(
              "h-14 rounded-2xl border-slate-200 bg-white shadow-sm transition-all font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
              errors.headline && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
            )}
            {...register("headline")}
          />
          {errors.headline && (
            <div className="flex items-center gap-1.5 text-rose-500 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-tighter">{errors.headline.message}</span>
            </div>
          )}
        </div>

        {/* 3. Years of Experience - ĐỒNG BỘ FULL WIDTH */}
        <div className="space-y-3">
          <Label htmlFor="yearsOfExperience" className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.15em]">
            Số năm kinh nghiệm <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </Label>
          <div className="relative group">
            <Input
              id="yearsOfExperience"
              type="number"
              placeholder="Nhập số năm..."
              className={cn(
                "h-14 rounded-2xl border-slate-200 bg-white shadow-sm transition-all font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
                errors.yearsOfExperience && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
              )}
              {...register("yearsOfExperience", {valueAsNumber: true})}
            />
          </div>
          {errors.yearsOfExperience && (
            <div className="flex items-center gap-1.5 text-rose-500 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-tighter">{errors.yearsOfExperience.message}</span>
            </div>
          )}
        </div>

        {/* 4. Biography */}
        <div className="space-y-3">
          <Label htmlFor="biography" className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.15em]">
            Tiểu sử chuyên gia <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </Label>
          <div className="relative group/bio">
            <Textarea
              id="biography"
              className={cn(
                "min-h-[220px] rounded-[1.5rem] border-slate-200 bg-white p-6 leading-relaxed transition-all resize-none font-medium text-slate-700 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0 shadow-sm",
                errors.biography && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
              )}
              {...register("biography")}
            />
            <div className="absolute bottom-5 right-5">
              <span className={cn(
                "text-[10px] font-mono font-black px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm transition-colors",
                bioContent.length < 50 || bioContent.length > 2000 ? "text-rose-500" : "text-slate-400 font-bold"
              )}>
                {bioContent.length}/2000
              </span>
            </div>
          </div>
          {errors.biography && (
            <div className="flex items-center gap-1.5 text-rose-500 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-tighter">{errors.biography.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-6">
        <Button 
          type="submit" 
          className="w-full h-16 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group"
        >
          Tiếp tục chỉnh sửa bằng cấp
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
}

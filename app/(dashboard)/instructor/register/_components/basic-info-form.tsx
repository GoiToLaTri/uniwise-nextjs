"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { instructorProfileSchema, type InstructorProfileFormValues } from "../_lib/form-schema";
import { cn } from "@/lib/utils";

// Pick các field cần thiết cho Step 1 từ Schema tổng
export type StepOneValues = Pick<InstructorProfileFormValues, "name" | "headline" | "biography" | "yearsOfExperience">;

interface BasicInfoFormProps {
  onNext: (data: StepOneValues) => void;
  initialData?: StepOneValues; // Thêm prop khởi tạo dữ liệu
}

export function BasicInfoForm({ onNext, initialData }: BasicInfoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StepOneValues>({
    resolver: zodResolver(instructorProfileSchema.pick({
      name: true,
      headline: true,
      biography: true,
      yearsOfExperience: true,
    })),
    // Ưu tiên lấy initialData nếu có, nếu không thì dùng giá trị mặc định
    defaultValues: initialData || {
      name: "",
      headline: "",
      biography: "",
      yearsOfExperience: 0,
    },
  });

  const bioContent = useWatch({ control, name: "biography" }) || "";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 1. Name Field */}
      <div className="space-y-2.5">
        <Label 
          htmlFor="name" 
          className="text-sm font-bold text-slate-700 flex items-center gap-2"
        >
          Tên giảng viên
        </Label>
        <Input
          id="name"
          placeholder="Nhập họ và tên giảng viên"
          className={cn(
            "h-12 rounded-xl border-slate-200 transition-all font-medium focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
            errors.name && "border-destructive focus-visible:border-destructive"
          )}
          {...register("name")}
        />
        <p className="text-[11px] text-slate-500 font-medium">
          Họ và tên giảng viên phải khớp với thông tin trong bằng cấp hoặc chứng chỉ của bạn.
        </p>
        {errors.name && (
          <div className="flex items-center gap-1.5 text-destructive mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black uppercase tracking-tighter">
              {errors.name.message}
            </span>
          </div>
        )}
      </div>
      {/* 2. Headline Field */}
      <div className="space-y-2.5">
        <Label 
          htmlFor="headline" 
          className="text-sm font-bold text-slate-700 flex items-center gap-2"
        >
          Tiêu đề chuyên môn
        </Label>
        <Input
          id="headline"
          placeholder="Ví dụ: Chuyên gia thiết kế hệ thống phân tán tại Google"
          className={cn(
            "h-12 rounded-xl border-slate-200 transition-all font-medium focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
            errors.headline && "border-destructive focus-visible:border-destructive"
          )}
          {...register("headline")}
        />
        <p className="text-[11px] text-slate-500 font-medium">
          Một câu ngắn gọn thể hiện giá trị cốt lõi của bạn. (Tối đa 150 ký tự)
        </p>
        {errors.headline && (
          <div className="flex items-center gap-1.5 text-destructive animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black uppercase tracking-tighter">
              {errors.headline.message}
            </span>
          </div>
        )}
      </div>

      {/* 3. Years of Experience Field */}
      <div className="space-y-3">
        <Label htmlFor="yearsOfExperience" className="text-sm font-bold text-slate-700">
          Số năm kinh nghiệm làm việc
        </Label>
        <Input
          id="yearsOfExperience"
          type="number"
          placeholder="Nhập số năm kinh nghiệm..."
          className={cn(
            "h-12 rounded-xl border-slate-200 w-full transition-all font-bold focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
            errors.yearsOfExperience && "border-destructive focus-visible:border-destructive"
          )}
          {...register("yearsOfExperience", { valueAsNumber: true })}
        />
        {errors.yearsOfExperience && (
          <div className="flex items-center gap-1.5 text-destructive mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black uppercase tracking-tighter">
              {errors.yearsOfExperience.message}
            </span>
          </div>
        )}
      </div>

      {/* 4. Biography Field */}
      <div className="space-y-2.5">
        <Label htmlFor="biography" className="text-sm font-bold text-slate-700">
          Tiểu sử & Quá trình công tác
        </Label>
        <div className="relative">
          <Textarea
            id="biography"
            placeholder="Hãy kể về hành trình của bạn, những dự án tiêu biểu và lý do bạn muốn giảng dạy..."
            className={cn(
              "min-h-[200px] rounded-2xl border-slate-200 p-4 leading-relaxed transition-all resize-none focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0",
              errors.biography && "border-destructive focus-visible:border-destructive"
            )}
            {...register("biography")}
          />
          <div className="absolute bottom-3 right-4">
            <span className={cn(
              "text-[10px] font-mono font-black px-2 py-1 rounded-md bg-slate-50 border border-slate-100",
              bioContent.length > 2000 ? "text-destructive" : "text-slate-400"
            )}>
              {bioContent.length}/2000
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Tối thiểu 50 ký tự để học viên tin tưởng bạn hơn.
        </p>
        {errors.biography && (
          <div className="flex items-center gap-1.5 text-destructive mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black uppercase tracking-tighter">
              {errors.biography.message}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-6">
        <Button 
          type="submit" 
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
        >
          Tiếp tục bước kế tiếp
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
}

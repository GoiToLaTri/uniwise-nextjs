"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, Trash2, AlertCircle, CheckCircle2, ArrowLeft, Cpu, BadgeCheck 
} from "lucide-react";
import { updateInstructorProfileSchema, type UpdateInstructorFormValues } from "../_lib/update-schema";
import { cn } from "@/lib/utils";
import { ConfirmSubmissionDialog } from "./confirm-submission-dialog";

type ExpertiseFormValues = Pick<UpdateInstructorFormValues, "expertises">;

interface ExpertiseUpdateFormProps {
  onSubmit: (data: ExpertiseFormValues) => void;
  onBack: () => void;
  initialData: ExpertiseFormValues;
  isSubmitting?: boolean;
}

const levels = [
  { value: "BEGINNER", label: "Cơ bản (Beginner)" },
  { value: "INTERMEDIATE", label: "Trung cấp (Intermediate)" },
  { value: "ADVANCED", label: "Nâng cao (Advanced)" },
  { value: "EXPERT", label: "Chuyên gia (Expert)" },
];

export function ExpertiseUpdateForm({ onSubmit, onBack, initialData, isSubmitting }: ExpertiseUpdateFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpertiseFormValues>({
    resolver: zodResolver(updateInstructorProfileSchema.pick({ expertises: true })),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expertises",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="space-y-16">
        {fields.map((field, index) => (
          <div 
            key={field.id} 
            className="w-full space-y-10 animate-in fade-in duration-500"
          >
            {/* Header Section - Đồng bộ Full-width */}
            <div className="flex items-center justify-between border-b-2 border-slate-50 pb-6 w-full">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">
                        Lĩnh vực chuyên môn #{index + 1}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                        Ref-ID: {field.id?.slice(0, 8) || "NEW"}
                    </p>
                </div>
              </div>
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="h-10 px-4 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Gỡ bỏ
                </Button>
              )}
            </div>

            {/* Grid Layout - 2 Cột đồng bộ h-14 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 w-full">
              
              {/* 1. Tên chuyên môn */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Tên chuyên môn / Kỹ năng</Label>
                <Input
                  placeholder="VD: AWS Cloud, ReactJS..."
                  className={cn(
                    "h-14 w-full rounded-2xl border-slate-200 bg-white px-5 font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 shadow-sm transition-all",
                    errors.expertises?.[index]?.name && "border-rose-500"
                  )}
                  {...register(`expertises.${index}.name` as const)}
                />
                {errors.expertises?.[index]?.name && (
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-tighter mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.expertises[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* 2. Trình độ (Select h-14 đồng bộ) */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Trình độ hiện tại</Label>
                <Controller
                  control={control}
                  name={`expertises.${index}.level`}
                  render={({ field: selectField }) => (
                    <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                      <SelectTrigger className={cn(
                        "!h-14 w-full rounded-2xl border-slate-200 bg-white px-5 font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 shadow-sm transition-all outline-hidden",
                        errors.expertises?.[index]?.level && "border-rose-500"
                      )}>
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1">
                        {levels.map((lvl) => (
                          <SelectItem key={lvl.value} value={lvl.value} className="font-bold py-3 px-4 focus:bg-indigo-50 focus:text-indigo-600 rounded-xl cursor-pointer">
                            {lvl.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* 3. Mô tả chi tiết kỹ năng */}
              <div className="lg:col-span-2 space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mô tả chi tiết năng lực</Label>
                <Textarea
                  placeholder="Mô tả cụ thể các dự án hoặc công nghệ bạn đã thực hiện trong lĩnh vực này..."
                  className="min-h-[140px] rounded-3xl border-slate-200 bg-white p-6 font-medium leading-relaxed resize-none focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 shadow-sm transition-all"
                  {...register(`expertises.${index}.description` as const)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button Thêm mới */}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: "", description: "", level: "INTERMEDIATE" })}
        className="w-full h-16 border-dashed border-2 border-slate-200 bg-slate-50/50 hover:border-blue-500 hover:bg-white hover:text-blue-600 rounded-3xl transition-all flex items-center justify-center gap-3 group"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-black uppercase tracking-[0.2em] text-[11px]">Thêm chuyên môn / kỹ năng khác</span>
      </Button>

      {/* Navigation Buttons */}
      <div className="flex gap-6 pt-12 border-t-2 border-slate-50 w-full">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Button>
        <ConfirmSubmissionDialog onConfirm={handleSubmit(onSubmit)} isLoading={Boolean(isSubmitting)}>
             <Button 
                type="button" // Chuyển thành button thường để Dialog Trigger quản lý
                className="flex-[2] h-16 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
             >
                Hoàn tất & Gửi xét duyệt
             </Button>
          </ConfirmSubmissionDialog>
      </div>
    </form>
  );
}
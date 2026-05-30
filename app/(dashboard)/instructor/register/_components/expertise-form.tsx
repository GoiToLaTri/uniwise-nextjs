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
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Cpu
} from "lucide-react";
import { instructorProfileSchema, type InstructorProfileFormValues } from "../_lib/form-schema";
import { cn } from "@/lib/utils";

type ExpertiseFormValues = Pick<InstructorProfileFormValues, "expertises">;

interface ExpertiseFormProps {
  onSubmit: (data: ExpertiseFormValues) => void;
  onBack: () => void;
  initialData?: ExpertiseFormValues;
}

const levels = [
  { value: "BEGINNER", label: "Cơ bản (Beginner)" },
  { value: "INTERMEDIATE", label: "Trung cấp (Intermediate)" },
  { value: "ADVANCED", label: "Nâng cao (Advanced)" },
  { value: "EXPERT", label: "Chuyên gia (Expert)" },
];

export function ExpertiseForm({ onSubmit, onBack, initialData }: ExpertiseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpertiseFormValues>({
    resolver: zodResolver(instructorProfileSchema.pick({ expertises: true })),
    defaultValues: initialData || {
      expertises: [{ name: "", description: "", level: "INTERMEDIATE" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expertises",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div 
            key={field.id} 
            className={cn(
              "group relative p-6 rounded-[1.5rem] border bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300",
              errors.expertises?.[index] ? "border-destructive/30" : "border-slate-200"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] shadow-md italic">
                  EXP
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
                  Lĩnh vực chuyên môn {fields.length > 1 && `#${index + 1}`}
                </h3>
              </div>
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              
              {/* 1. Tên chuyên môn */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Chuyên môn chính <Cpu className="w-3.5 h-3.5 text-blue-500" />
                </Label>
                <Input
                  placeholder="VD: Lập trình ReactJS, UI/UX Design..."
                  className={cn(
                    "h-12 rounded-xl border-slate-200 bg-white transition-all font-medium focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500",
                    errors.expertises?.[index]?.name && "border-destructive focus-visible:border-destructive"
                  )}
                  {...register(`expertises.${index}.name` as const)}
                />
                {errors.expertises?.[index]?.name && (
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-tighter animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {errors.expertises[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* 2. Trình độ - SELECT (Đã fix đồng bộ style h-12) */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">Trình độ của bạn</Label>
                <Controller
                  control={control}
                  name={`expertises.${index}.level`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={cn(
                        "!h-12 !w-full rounded-xl border-slate-200 bg-white font-medium focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-hidden",
                        errors.expertises?.[index]?.level && "border-destructive"
                      )}>
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-1">
                        {levels.map((lvl) => (
                          <SelectItem 
                            key={lvl.value} 
                            value={lvl.value} 
                            className="text-[14px] focus:bg-indigo-50 focus:text-indigo-600 rounded-lg cursor-pointer py-2.5 px-3 font-medium"
                          >
                            {lvl.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.expertises?.[index]?.level && (
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-tighter">
                    <AlertCircle className="w-3 h-3" /> {errors.expertises[index]?.level?.message}
                  </p>
                )}
              </div>

              {/* 3. Mô tả chi tiết kỹ năng */}
              <div className="md:col-span-2 space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">Mô tả kỹ năng cụ thể</Label>
                <Textarea
                  placeholder="Mô tả cụ thể các công nghệ, công cụ hoặc kỹ năng bạn am hiểu trong lĩnh vực này..."
                  className="min-h-[100px] rounded-2xl border-slate-200 bg-white p-4 transition-all resize-none focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
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
        className="w-full h-14 border-dashed border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-sm"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-bold uppercase tracking-widest text-[11px]">Thêm lĩnh vực chuyên môn khác</span>
      </Button>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-8 border-t border-slate-100">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Button>
        <Button 
          type="submit" 
          className="flex-[2] h-12 bg-linear-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
        >
          Hoàn tất & Gửi hồ sơ
          <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform shadow-sm" />
        </Button>
      </div>
    </form>
  );
}
"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CalendarIcon,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { instructorProfileSchema, type InstructorProfileFormValues } from "../_lib/form-schema";
import { cn } from "@/lib/utils";
import styles from "../_css/calendar.module.css"

type DegreesFormValues = Pick<InstructorProfileFormValues, "degrees">;

export function DegreesForm({ onNext, onBack, initialData }: { onNext: (data: DegreesFormValues) => void, onBack: () => void, initialData?: DegreesFormValues }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DegreesFormValues>({
    resolver: zodResolver(instructorProfileSchema.pick({ degrees: true })),
    defaultValues: initialData || {
      degrees: [{ type: "", name: "", institution: "", issuedDate: "", description: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "degrees",
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div 
            key={field.id} 
            className={cn(
                "group relative p-6 rounded-[1.5rem] border bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300",
                errors.degrees?.[index] ? "border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]" : "border-slate-200"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {index + 1}
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
                  Thông tin bằng cấp {fields.length > 1 && `#${index + 1}`}
                </h3>
              </div>
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost" size="icon"
                  onClick={() => remove(index)}
                  className="text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              
              {/* 1. Loại bằng cấp */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">Loại bằng cấp</Label>
                <Controller
                  control={control}
                  name={`degrees.${index}.type`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={cn(
                        "!h-12 !w-full rounded-xl border-slate-200 bg-white font-medium focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 outline-hidden",
                        errors.degrees?.[index]?.type && "border-destructive"
                      )}>
                        <SelectValue placeholder="Chọn loại bằng cấp" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-1">
                        {["Cử nhân", "Thạc sĩ", "Tiến sĩ", "Chứng chỉ chuyên môn", "Khác"].map((t) => (
                            <SelectItem key={t} value={t} className="text-[14px] focus:bg-indigo-50 focus:text-indigo-600 rounded-lg cursor-pointer py-2.5 px-3">
                                {t}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.degrees?.[index]?.type && (
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-tighter animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {errors.degrees[index]?.type?.message}
                  </p>
                )}
              </div>

              {/* 2. Tên chuyên ngành */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">Tên chuyên ngành</Label>
                <Input
                  placeholder="VD: Khoa học máy tính"
                  className={cn(
                    "h-12 rounded-xl border-slate-200 bg-white transition-all font-medium focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500",
                    errors.degrees?.[index]?.name && "border-destructive focus-visible:border-destructive"
                  )}
                  {...register(`degrees.${index}.name` as const)}
                />
                {errors.degrees?.[index]?.name && (
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-tighter">
                    <AlertCircle className="w-3 h-3" /> {errors.degrees[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* 3. Tổ chức cấp bằng */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">Tổ chức cấp bằng</Label>
                <Input
                  placeholder="VD: Đại học Quốc gia Hà Nội"
                  className={cn(
                    "h-12 rounded-xl border-slate-200 bg-white transition-all font-medium focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500",
                    errors.degrees?.[index]?.institution && "border-destructive focus-visible:border-destructive"
                  )}
                  {...register(`degrees.${index}.institution` as const)}
                />
                {errors.degrees?.[index]?.institution && (
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-tighter">
                    <AlertCircle className="w-3 h-3" /> {errors.degrees[index]?.institution?.message}
                  </p>
                )}
              </div>

              {/* 4. Ngày cấp */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">Ngày cấp</Label>
                <Controller
                  control={control}
                  name={`degrees.${index}.issuedDate`}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-between text-left font-medium rounded-xl border-slate-200 bg-white hover:bg-white hover:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/30",
                            !field.value && "text-slate-400",
                            errors.degrees?.[index]?.issuedDate && "border-destructive"
                          )}
                        >
                          <span className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                            {field.value ? format(new Date(field.value), "dd/MM/yyyy") : "Chọn ngày"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl" align="start">
                        <div className={styles.wrapper}>
                            <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            disabled={(date) => date > new Date()}
                            locale={vi}
                            // Custom style chọn ngày chuẩn Indigo thương hiệu
                            styles={{
                                selected: { backgroundColor: "#4f46e5", color: "white", borderRadius: "8px" },
                            }}
                            />
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.degrees?.[index]?.issuedDate && (
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-tighter">
                    <AlertCircle className="w-3 h-3" /> {errors.degrees[index]?.issuedDate?.message}
                  </p>
                )}
              </div>

              {/* 5. Mô tả chi tiết */}
              <div className="md:col-span-2 space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">Mô tả chi tiết (Tùy chọn)</Label>
                <Textarea
                  placeholder="Thành tích tiêu biểu hoặc nội dung đào tạo..."
                  className="min-h-[100px] rounded-2xl border-slate-200 bg-white p-4 transition-all resize-none focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
                  {...register(`degrees.${index}.description` as const)}
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
        onClick={() => append({ type: "", name: "", institution: "", issuedDate: "", description: "", credentialUrl: "" })}
        className="w-full h-14 border-dashed border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-sm"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-bold uppercase tracking-widest text-[11px]">Thêm bằng cấp/chứng chỉ khác</span>
      </Button>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-8 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Button>
        <Button type="submit" className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group">
          Tiếp tục bước cuối <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
}
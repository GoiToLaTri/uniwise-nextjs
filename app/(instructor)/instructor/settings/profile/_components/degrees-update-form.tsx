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
  ArrowRight, ArrowLeft, Plus, Trash2, 
  CalendarIcon, AlertCircle, ChevronDown, Award 
} from "lucide-react";
import { updateInstructorProfileSchema, type UpdateInstructorFormValues } from "../_lib/update-schema";
import { cn } from "@/lib/utils";
import styles from "../_css/calendar.module.css"

type DegreesFormValues = Pick<UpdateInstructorFormValues, "degrees">;

const degreeTypes = [
  { value: "BACHELOR", label: "Cử nhân (Bachelor)" },
  { value: "MASTER", label: "Thạc sĩ (Master)" },
  { value: "DOCTOR", label: "Tiến sĩ (Doctor)" },
  { value: "CERTIFICATE", label: "Chứng chỉ (Certificate)" },
  { value: "OTHER", label: "Khác" }
];

export function DegreesUpdateForm({ onNext, onBack, initialData }: { onNext: (data: DegreesFormValues) => void, onBack: () => void, initialData: DegreesFormValues }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DegreesFormValues>({
    resolver: zodResolver(updateInstructorProfileSchema.pick({ degrees: true })),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "degrees",
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="w-full space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="space-y-12">
        {fields.map((field, index) => (
          <div 
            key={field.id} 
            className="relative space-y-8 animate-in fade-in duration-500"
          >
            {/* Header đồng bộ - Không dùng viền bao quanh để giữ chiều ngang rộng */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                  {index + 1}
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
                  Thông tin bằng cấp #{index + 1}
                </h3>
              </div>
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="h-9 px-3 text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa mục này
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              
              {/* 1. Loại bằng cấp (Đã đồng bộ h-14, rounded-2xl, bg-white) */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Loại bằng cấp</Label>
                <Controller
                  control={control}
                  name={`degrees.${index}.type`}
                  render={({ field: selectField }) => (
                    <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                      <SelectTrigger className={cn(
                        "!h-14 w-full rounded-2xl border-slate-200 bg-white font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 outline-hidden transition-all shadow-sm",
                        errors.degrees?.[index]?.type && "border-rose-500"
                      )}>
                        <SelectValue placeholder="Chọn loại bằng" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1">
                        {degreeTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="font-bold focus:bg-indigo-50 focus:text-indigo-600 rounded-xl py-3 px-4 cursor-pointer">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.degrees?.[index]?.type && (
                  <p className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-tighter mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.degrees[index]?.type?.message}
                  </p>
                )}
              </div>

              {/* 2. Tên chuyên ngành */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Tên chuyên ngành</Label>
                <Input
                  placeholder="VD: Khoa học máy tính"
                  className={cn(
                    "h-14 rounded-2xl border-slate-200 bg-white font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 shadow-sm",
                    errors.degrees?.[index]?.name && "border-rose-500"
                  )}
                  {...register(`degrees.${index}.name` as const)}
                />
              </div>

              {/* 3. Tổ chức đào tạo */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Tổ chức / Trường học</Label>
                <Input
                  placeholder="VD: Đại học Bách Khoa"
                  className={cn(
                    "h-14 rounded-2xl border-slate-200 bg-white font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 shadow-sm",
                    errors.degrees?.[index]?.institution && "border-rose-500"
                  )}
                  {...register(`degrees.${index}.institution` as const)}
                />
              </div>

              {/* 4. Ngày cấp */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Ngày cấp bằng</Label>
                <Controller
                  control={control}
                  name={`degrees.${index}.issuedDate`}
                  render={({ field: dateField }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-14 justify-between text-left font-bold rounded-2xl border-slate-200 bg-white hover:bg-white hover:border-indigo-500 transition-all shadow-sm",
                            !dateField.value && "text-slate-400",
                            errors.degrees?.[index]?.issuedDate && "border-rose-500"
                          )}
                        >
                          <span className="flex items-center">
                            <CalendarIcon className="mr-3 h-5 w-5 text-indigo-500" />
                            {dateField.value ? format(new Date(dateField.value), "dd/MM/yyyy") : "Chọn ngày"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-[1.5rem] border-slate-200 shadow-2xl" align="start">
                        <div className={styles.wrapper}>
                            <Calendar
                            mode="single"
                            selected={dateField.value ? new Date(dateField.value) : undefined}
                            onSelect={(date) => date && dateField.onChange(format(date, "yyyy-MM-dd"))}
                            disabled={(date) => date > new Date()}
                            locale={vi}
                            captionLayout="dropdown"
                            styles={{
                                selected: { backgroundColor: "#4f46e5", color: "white", borderRadius: "8px" },
                            }}
                            classNames={{
                                caption_label: "hidden", // Ẩn label mặc định khi dùng dropdown
                                // dropdown_month: "flex-1",
                                // dropdown_year: "flex-1",
                                dropdown: "bg-transparent font-bold text-sm focus:outline-none cursor-pointer p-1 rounded-md hover:bg-slate-100",
                                // vhidden: "hidden", // Ẩn các phần tử bổ trợ của react-day-picker
                                // caption_dropdowns: "flex gap-2 w-full mb-2"
                            }}
                            />
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              {/* 5. Mô tả chi tiết */}
              <div className="md:col-span-2 space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Mô tả thành tích</Label>
                <Textarea
                  placeholder="Tóm tắt quá trình học tập hoặc thành tích đạt được..."
                  className="min-h-[120px] rounded-2xl border-slate-200 bg-white p-5 font-medium leading-relaxed resize-none focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 shadow-sm"
                  {...register(`degrees.${index}.description` as const)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button Thêm mới - Rộng bằng form */}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ type: "", name: "", institution: "", issuedDate: "", description: "" })}
        className="w-full h-16 border-dashed border-2 border-slate-200 bg-slate-50/30 hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-2xl transition-all flex items-center justify-center gap-3 group"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-black uppercase tracking-[0.2em] text-[11px]">Thêm thông tin bằng cấp khác</span>
      </Button>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-10 border-t border-slate-100">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Button>
        <Button 
          type="submit" 
          className="flex-[2] h-16 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
        >
          Tiếp tục bước cuối
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
}
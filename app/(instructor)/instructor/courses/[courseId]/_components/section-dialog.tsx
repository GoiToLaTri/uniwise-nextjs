"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, Layers } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCreateSection, useUpdateSection } from "@/hooks/use-section";

const sectionSchema = z.object({
  title: z.string().min(3, "Tên chương học phải có ít nhất 3 ký tự"),
});

type FormValues = z.infer<typeof sectionSchema>;

interface SectionDialogProps {
  children: React.ReactNode;
  courseId: string; // publicId cho refetch/invalidate
  courseDbId: string; // id thực tế trong DB để gửi lên API
  initialData?: {
    id: string;
    publicId: string;
    title: string;
    sortOrder: number;
  };
  nextSortOrder?: number;
  onSuccess?: () => void;
}

export function SectionDialog({
  children,
  courseId,
  courseDbId,
  initialData,
  nextSortOrder = 0,
  onSuccess,
}: SectionDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;

  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: initialData?.title || "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.publicId || initialData.id,
          courseId,
          data: {
            title: values.title,
            sortOrder: initialData.sortOrder,
          },
        });
      } else {
        await createMutation.mutateAsync({
          courseId,
          data: {
            courseId: courseDbId,
            title: values.title,
            sortOrder: nextSortOrder,
          },
        });
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      // Đã toast trong hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 rounded-[1.5rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className={cn("h-2", isEdit ? "bg-amber-500" : "bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500")} />

        <DialogHeader className="px-8 pt-8 text-left">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", isEdit ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600")}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                {isEdit ? "Cập Nhật Chương Học" : "Thêm Chương Học Mới"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic text-xs mt-0.5">
                {isEdit ? "Thay đổi tiêu đề chương học này." : "Nhập tiêu đề để tạo một chương học mới."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tên chương học
            </Label>
            <Input
              {...register("title")}
              placeholder="VD: Chương 1: Tổng quan và cài đặt môi trường"
              className={cn("h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500", errors.title && "border-rose-500 focus-visible:ring-rose-500/10")}
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.title.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11 px-5" disabled={isPending}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "font-black rounded-xl h-11 px-8 shadow-lg active:scale-95 transition-all",
                isEdit ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "LƯU THÔNG TIN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

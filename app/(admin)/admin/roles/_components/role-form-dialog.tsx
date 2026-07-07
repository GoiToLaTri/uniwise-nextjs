"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ShieldPlus, Info, KeyRound, AlignLeft, 
  Save, Loader2, AlertCircle 
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateRole, useUpdateRole } from "@/hooks/use-role";

// Schema cho cả create và update
const roleSchema = z.object({
  displayName: z.string()
    .min(2, "Tên hiển thị tối thiểu 2 ký tự")
    .max(50, "Tên hiển thị quá dài"),
  name: z.string()
    .min(2, "Mã vai trò tối thiểu 2 ký tự")
    .regex(/^[A-Z0-9_]+$/, "Mã chỉ gồm chữ HOA, số và dấu gạch dưới (VD: ADMIN_PRO)"),
  description: z.string()
    .min(5, "Mô tả vai trò tối thiểu 5 ký tự")
    .max(200, "Mô tả không nên vượt quá 200 ký tự"),
  isActive: z.boolean().optional(), // Optional cho create
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
  children: React.ReactNode;
  initialData?: RoleFormValues & { id?: number; isActive?: boolean };
}

export function RoleFormDialog({ children, initialData }: RoleFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  
  const isEditMode = !!initialData?.id;
  const isSubmitting = createRoleMutation.isPending || updateRoleMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData || {
      displayName: "",
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Tự động viết hoa trường Name
  const nameValue = watch("name");
  React.useEffect(() => {
    if (nameValue && !isEditMode) {
      setValue("name", nameValue.toUpperCase(), { shouldValidate: true });
    }
  }, [nameValue, setValue, isEditMode]);

  // Reset form khi đóng dialog
  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (values: RoleFormValues) => {
    try {
      if (isEditMode && initialData?.id) {
        // Update mode
        await updateRoleMutation.mutateAsync({
          id: initialData.id,
          data: {
            name: values.name,
            description: values.description,
            isActive: initialData.isActive ?? true,
          },
        });
      } else {
        // Create mode
        await createRoleMutation.mutateAsync({
          displayName: values.displayName,
          name: values.name,
          description: values.description,
          isActive: true,
        });
      }
      
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[1.25rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className={cn("h-2", isEditMode ? "bg-amber-500" : "h-2 bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500")} />

        <DialogHeader className="px-8 pt-8">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShieldPlus className="w-6 h-6 text-indigo-600" />
            {isEditMode ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500 italic">
            {isEditMode 
              ? "Cập nhật thông tin vai trò" 
              : "Vui lòng điền chính xác thông tin để phân quyền hệ thống."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5">
          
          {/* Tên hiển thị - disabled khi edit vì không có trong API update */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Info className="w-3 h-3" /> Tên hiển thị
            </Label>
            <Input
              {...register("displayName")}
              placeholder="Ví dụ: Quản trị viên"
              disabled={isSubmitting || isEditMode}
              className={cn(
                "h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500",
                errors.displayName && "border-rose-500 focus-visible:ring-rose-500/20",
                isEditMode && "bg-slate-50 text-slate-500"
              )}
            />
            {errors.displayName && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="w-3 h-3" /> {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Mã hệ thống - disabled khi edit */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <KeyRound className="w-3 h-3" /> Mã hệ thống (Internal Name)
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[10px] font-black text-slate-400 select-none">ROLE_</span>
              <Input
                {...register("name")}
                placeholder="ADMIN_PRO"
                disabled={isSubmitting || isEditMode}
                className={cn(
                  "h-11 pl-14 rounded-xl font-mono border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500",
                  errors.name && "border-rose-500",
                  isEditMode && "opacity-70"
                )}
              />
            </div>
            {errors.name && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="w-3 h-3" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" /> Mô tả chi tiết
            </Label>
            <Textarea
              {...register("description")}
              placeholder="Giải thích quyền hạn của vai trò này..."
              disabled={isSubmitting}
              className={cn(
                "min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none",
                errors.description && "border-rose-500"
              )}
            />
            {errors.description && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="w-3 h-3" /> {errors.description.message}
              </p>
            )}
          </div>

          {/* Trạng thái Active - chỉ hiển thị khi edit */}
          {isEditMode && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                Trạng thái
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Kích hoạt vai trò này
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="pt-6 border-t border-slate-50">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="font-bold rounded-xl h-11 text-slate-500"
            >
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={cn(
                "font-black rounded-xl h-11 px-8 shadow-lg transition-all active:scale-95 min-w-[120px]",
                isEditMode ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ĐANG XỬ LÝ...
                </>
              ) : "XÁC NHẬN"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
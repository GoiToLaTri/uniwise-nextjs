"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Key, Loader2, AlertCircle } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreatePermission, useUpdatePermission } from "@/hooks/use-permission";

// Import hooks

const permissionSchema = z.object({
  name: z.string()
    .min(3, "Tên quyền tối thiểu 3 ký tự")
    .regex(/^[a-z0-9:-]+$/, "Định dạng không hợp lệ. Ví dụ: resource:action (chỉ dùng chữ thường, số, dấu : và -)"),
  description: z.string().min(5, "Vui lòng mô tả chi tiết nhiệm vụ của quyền này"),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

export function PermissionFormDialog({ children, initialData, onSuccess }: { children: React.ReactNode, initialData?: any, onSuccess: () => void }) {
  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;
  
  // Sử dụng cả 2 hooks
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission(); // Cần tạo hook này

  const isPending = createPermission.isPending || updatePermission.isPending;

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: initialData || { name: "", description: "" },
  });

  // Reset form khi initialData thay đổi
  React.useEffect(() => {
    if (open && initialData) {
      reset(initialData);
    } else if (open && !initialData) {
      reset({ name: "", description: "" });
    }
  }, [open, initialData, reset]);

  // Logic Tự động chuyển về lowercase khi người dùng nhập
  const nameValue = watch("name");
  React.useEffect(() => {
    if (nameValue && !isEdit) { // Chỉ tự động format khi tạo mới, không khi edit
      setValue("name", nameValue.toLowerCase().replace(/\s+/g, '-'), { shouldValidate: true });
    }
  }, [nameValue, setValue, isEdit]);

  const onSubmit = async (values: PermissionFormValues) => {
    try {
      if (isEdit && initialData) {
        // Cập nhật
        await updatePermission.mutateAsync({ id: initialData.id, data: values });
        // toast.success("Cập nhật quyền hạn thành công");
      } else {
        // Tạo mới
        await createPermission.mutateAsync(values);
        // toast.success("Đã tạo quyền hạn mới");
      }
      setOpen(false);
      onSuccess();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 rounded-[1.25rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className={cn("h-2", isEdit ? "bg-amber-500" : "bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500")} />
        
        <DialogHeader className="px-8 pt-8 text-left">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Key className={cn("w-6 h-6", isEdit ? "text-amber-500" : "text-indigo-600")} />
            {isEdit ? "Cập nhật Quyền" : "Tạo Quyền mới"}
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500 italic">
            Sử dụng định dạng <code className="text-indigo-600 font-bold">resource:action</code>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Định danh Quyền (Key)</Label>
            <div className="relative">
              <Input 
                {...register("name")}
                placeholder="ví dụ: instructors:apply"
                className={cn(
                  "h-11 rounded-xl font-mono text-sm border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500",
                  errors.name && "border-rose-500 focus-visible:ring-rose-500/20"
                )}
                disabled={isPending || isEdit} // Không cho sửa tên quyền khi edit
              />
            </div>
            {errors.name ? (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name.message}
              </p>
            ) : (
              <p className="text-[9px] text-slate-400 font-medium">
                {isEdit ? "⚠️ Không thể thay đổi định danh quyền sau khi tạo" : "Gợi ý: courses:read, users:write"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mô tả mục đích</Label>
            <Textarea 
              {...register("description")}
              placeholder="Ví dụ: Cho phép người dùng gửi đơn đăng ký làm giảng viên."
              className={cn(
                "min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none",
                errors.description && "border-rose-500"
              )}
              disabled={isPending}
            />
            {errors.description && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description.message}</p>}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11" disabled={isPending}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className={cn(
                "font-black rounded-xl h-11 px-8 shadow-lg transition-all active:scale-95 min-w-[120px]",
                isEdit ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "XÁC NHẬN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
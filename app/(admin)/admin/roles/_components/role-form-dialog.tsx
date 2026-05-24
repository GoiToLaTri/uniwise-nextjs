"use client";

import * as React from "react";
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

interface RoleFormDialogProps {
  children: React.ReactNode;
  initialData?: {
    id?: string;
    name: string;
    code: string;
    description: string;
  };
}

export function RoleFormDialog({ children, initialData }: RoleFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // State quản lý Form
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    code: initialData?.code || "ROLE_",
    description: initialData?.description || "",
  });

  // State quản lý Error
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form khi đóng/mở
  React.useEffect(() => {
    if (open) {
      setFormData(initialData || { name: "", code: "ROLE_", description: "" });
      setErrors({});
    }
  }, [open, initialData]);

  // Hàm Validate thủ công
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.length < 2) newErrors.name = "Tên vai trò tối thiểu 2 ký tự";
    if (!formData.code.startsWith("ROLE_") || formData.code.length < 6) {
      newErrors.code = "Mã phải bắt đầu bằng ROLE_ và viết hoa";
    }
    if (formData.description.length < 5) newErrors.description = "Mô tả quá ngắn";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Giả lập API call
      console.log("Submitting:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success(initialData ? "Đã cập nhật vai trò" : "Đã tạo vai trò mới");
      setOpen(false);
    } catch (error) {
      toast.error("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[1.25rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        {/* Decorative Top Bar */}
        <div className="h-2 bg-linear-to-r from-indigo-600 to-blue-500" />

        <DialogHeader className="px-8 pt-8">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShieldPlus className="w-6 h-6 text-indigo-600" />
            {initialData ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Cung cấp thông tin định danh cho vai trò này.
          </DialogDescription>
        </DialogHeader>

        {/* FORM THƯỜNG */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Tên hiển thị */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Info className="w-3 h-3" /> Tên hiển thị
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Giảng viên cấp cao"
              className={cn(
                "h-12 rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500",
                errors.name && "border-rose-500 focus-visible:ring-rose-500/20"
              )}
            />
            {errors.name && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
          </div>

          {/* Mã định danh */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <KeyRound className="w-3 h-3" /> Mã hệ thống (System Code)
            </Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="ROLE_INSTRUCTOR"
              className={cn(
                "h-12 rounded-xl font-mono border-slate-200 bg-slate-50",
                errors.code && "border-rose-500"
              )}
            />
            {errors.code && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.code}</p>}
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" /> Mô tả vai trò
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả các quyền hạn cơ bản..."
              className={cn(
                "min-h-[100px] rounded-xl border-slate-200 resize-none",
                errors.description && "border-rose-500"
              )}
            />
            {errors.description && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
          </div>

          <DialogFooter className="pt-6 border-t border-slate-50">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="font-bold rounded-xl h-12"
            >
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl h-12 px-8 active:scale-95 transition-all shadow-lg shadow-indigo-100 min-w-[140px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {initialData ? "LƯU THAY ĐỔI" : "TẠO VAI TRÒ"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
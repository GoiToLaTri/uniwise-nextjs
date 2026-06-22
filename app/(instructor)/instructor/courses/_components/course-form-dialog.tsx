"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, BookOpen, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateCourse, useUpdateCourse } from "@/hooks/use-course";
import { usePriceTiers } from "@/hooks/use-price-tier";
import { useUploadThumbnail } from "@/hooks/use-upload";

// ─── ZOD SCHEMA ───
const courseSchema = z.object({
  title: z.string().min(5, "Tiêu đề khóa học phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả khóa học phải có ít nhất 10 ký tự"),
  thumbnailUrl: z.string().url("Đường dẫn hình ảnh không hợp lệ").or(z.literal("")),
  thumbnailName: z.string().optional(),
  priceTierId: z.string(),
  status: z.string(),
});

type FormValues = z.infer<typeof courseSchema>;

interface CourseFormDialogProps {
  children: React.ReactNode;
  initialData?: any;
  onSuccess?: () => void;
}

export function CourseFormDialog({ children, initialData, onSuccess }: CourseFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  
  // Lấy danh sách price tiers để chọn (tối đa 100 mức giá)
  const { data: priceTiersData } = usePriceTiers(0, 100);
  const priceTiers = priceTiersData?.content || [];

  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData ? {
      title: initialData.title || "",
      description: initialData.description || "",
      thumbnailUrl: initialData.thumbnailUrl || "",
      thumbnailName: initialData.thumbnailName || "",
      priceTierId: initialData.priceTierId || "",
      status: initialData.status || "DRAFT",
    } : {
      title: "",
      description: "",
      thumbnailUrl: "",
      thumbnailName: "",
      priceTierId: "",
      status: "DRAFT",
    },
  });

  const thumbnailUrl = watch("thumbnailUrl");
  const priceTierId = watch("priceTierId");
  const status = watch("status");

  const uploadMutation = useUploadThumbnail();
  const isUploading = uploadMutation.isPending;
  const [showUrlInput, setShowUrlInput] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa là 5MB");
      return;
    }

    try {
      const response = await uploadMutation.mutateAsync(file);
      const uploadedUrl = response?.url;
      const uploadedName = response?.fileName;

      if (uploadedUrl) {
        setValue("thumbnailUrl", uploadedUrl, { shouldValidate: true });
        setValue("thumbnailName", uploadedName || "", { shouldValidate: true });
        toast.success("Tải ảnh bìa lên thành công!");
      } else {
        throw new Error("Không lấy được đường dẫn ảnh từ phản hồi.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
    }
  };

  React.useEffect(() => {
    if (open) {
      reset(initialData ? {
        title: initialData.title || "",
        description: initialData.description || "",
        thumbnailUrl: initialData.thumbnailUrl || "",
        thumbnailName: initialData.thumbnailName || "",
        priceTierId: initialData.priceTierId || "",
        status: initialData.status || "DRAFT",
      } : {
        title: "",
        description: "",
        thumbnailUrl: "",
        thumbnailName: "",
        priceTierId: "",
        status: "DRAFT",
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: initialData.publicId,
          data: {
            ...values,
            thumbnailName: values.thumbnailName || "",
          },
        });
      } else {
        // Khi tạo mới, ép các giá trị mặc định theo yêu cầu của user
        await createMutation.mutateAsync({
          ...values,
          status: "DRAFT",
          thumbnailUrl: values.thumbnailUrl || "",
          thumbnailName: values.thumbnailName || "",
          priceTierId: values.priceTierId || "",
        });
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      // toast.error được handle trong hook mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 rounded-[1.5rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className={cn("h-2", isEdit ? "bg-amber-500" : "bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500")} />

        <DialogHeader className="px-8 pt-8 text-left">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", isEdit ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600")}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                {isEdit ? "Cập Nhật Khóa Học" : "Tạo Khóa Học Mới"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic text-xs">
                {isEdit ? "Điều chỉnh thông tin chi tiết và định giá cho khóa học của bạn." : "Nhập tên và mô tả để bắt đầu phác thảo khóa học mới (mặc định ở trạng thái DRAFT)."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* 1. Tiêu Đề Khóa Học */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tiêu đề khóa học
            </Label>
            <Input
              {...register("title")}
              placeholder="VD: Lập trình Web Fullstack với Next.js & Spring Boot"
              className={cn("h-11 rounded-xl border-slate-200", errors.title && "border-rose-500 focus-visible:ring-rose-500/10")}
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.title.message}
              </p>
            )}
          </div>

          {/* 2. Mô Tả Ngắn */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Mô tả khóa học
            </Label>
            <Textarea
              {...register("description")}
              placeholder="Nhập mô tả tóm tắt nội dung chính và giá trị học viên nhận được từ khóa học..."
              className={cn("min-h-[100px] rounded-xl border-slate-200 resize-none", errors.description && "border-rose-500 focus-visible:ring-rose-500/10")}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.description.message}
              </p>
            )}
          </div>

          {/* CHỈ HIỂN THỊ CÁC FIELD DƯỚI ĐÂY KHI EDIT */}
          {isEdit && (
            <>
              {/* 3. Ảnh bìa (Thumbnail Upload) */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Ảnh bìa khóa học
                </Label>
                
                {/* Upload Box container */}
                <div 
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-400 transition-all flex flex-col items-center justify-center aspect-video cursor-pointer",
                    errors.thumbnailUrl && "border-rose-300 bg-rose-50/20",
                    isUploading && "pointer-events-none"
                  )}
                  onClick={() => document.getElementById("thumbnail-file-input")?.click()}
                >
                  <input
                    id="thumbnail-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-xs font-bold text-slate-600">Đang tải ảnh lên...</p>
                    </div>
                  ) : thumbnailUrl ? (
                    <>
                      <img
                        src={thumbnailUrl}
                        alt="Course Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay hover effect */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-xs font-bold">Thay đổi ảnh bìa</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Tải ảnh bìa lên</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Định dạng JPG, PNG, WEBP (Tối đa 5MB)</p>
                    </div>
                  )}
                </div>

                {/* Toggle Input URL fallback */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-wider bg-transparent border-none cursor-pointer focus:outline-hidden"
                  >
                    {showUrlInput ? "Ẩn nhập URL" : "Hoặc sử dụng đường dẫn ảnh (URL)"}
                  </button>
                </div>

                {showUrlInput && (
                  <div className="space-y-1 mt-2 animate-in slide-in-from-top-2 duration-300">
                    <Input
                      {...register("thumbnailUrl")}
                      placeholder="https://images.unsplash.com/... hoặc link ảnh"
                      className={cn("h-11 rounded-xl border-slate-200 text-xs", errors.thumbnailUrl && "border-rose-500")}
                      disabled={isPending}
                    />
                  </div>
                )}
                
                {errors.thumbnailUrl && (
                  <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.thumbnailUrl.message}
                  </p>
                )}
              </div>

              {/* 4. Cấu hình mức giá & Trạng thái */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chọn Mức Giá */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Mức giá định mức
                  </Label>
                  <Select
                    disabled={isPending}
                    value={priceTierId || "empty"}
                    onValueChange={(v) => setValue("priceTierId", v === "empty" ? "" : v)}
                  >
                    <SelectTrigger className={cn("!h-11 rounded-xl border-slate-200 bg-white font-semibold w-full", errors.priceTierId && "border-rose-500")}>
                      <SelectValue placeholder="Chọn mức giá..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="empty" className="font-semibold text-slate-400 italic cursor-pointer">
                        Chưa định giá (Miễn phí)
                      </SelectItem>
                      {priceTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id} className="font-semibold cursor-pointer">
                          {tier.tierName} ({new Intl.NumberFormat().format(tier.priceAmount)} {tier.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.priceTierId && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.priceTierId.message}
                    </p>
                  )}
                </div>

                {/* Chọn Trạng thái */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Trạng thái
                  </Label>
                  <Select
                    disabled={isPending}
                    value={status}
                    onValueChange={(v) => setValue("status", v)}
                  >
                    <SelectTrigger className={cn("!h-11 rounded-xl border-slate-200 bg-white font-semibold w-full", errors.status && "border-rose-500")}>
                      <SelectValue placeholder="Chọn trạng thái..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="DRAFT" className="font-semibold text-slate-600 cursor-pointer">Bản nháp (DRAFT)</SelectItem>
                      <SelectItem value="PUBLISHED" className="font-semibold text-emerald-600 cursor-pointer">Công khai (PUBLISHED)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11 px-6" disabled={isPending}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "font-black rounded-xl h-11 px-10 shadow-lg active:scale-95 transition-all flex-1 sm:flex-none",
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

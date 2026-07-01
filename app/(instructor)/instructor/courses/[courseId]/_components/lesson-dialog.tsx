"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, PlayCircle, Video, Paperclip, Link as LinkIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateLesson, useUpdateLesson } from "@/hooks/use-lesson";
import { useUploadStore } from "@/stores/upload-store";
import { toast } from "sonner";

const lessonSchema = z.object({
  title: z.string().min(3, "Tên bài giảng phải có ít nhất 3 ký tự"),
  lessonType: z.string(),
  contentReference: z.string().optional(),
});

type FormValues = z.infer<typeof lessonSchema>;

interface LessonDialogProps {
  children: React.ReactNode;
  courseId: string;
  sectionId: string;
  initialData?: {
    id: string;
    publicId: string;
    sectionId: string;
    title: string;
    lessonType: string;
    contentReference: string;
    sortOrder: number;
    status?: string;
  };
  nextSortOrder?: number;
  onSuccess?: () => void;
}

export function LessonDialog({
  children,
  courseId,
  sectionId,
  initialData,
  nextSortOrder = 0,
  onSuccess,
}: LessonDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const startUpload = useUploadStore((state) => state.startUpload);

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Trạng thái chọn tệp video cục bộ
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadMode, setUploadMode] = React.useState<"file" | "url">(
    initialData?.lessonType === "VIDEO" && initialData.contentReference.startsWith("http")
      ? "url"
      : "file"
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || "",
      lessonType: initialData?.lessonType || "VIDEO",
      contentReference: initialData?.contentReference || "",
    },
  });

  const lessonType = watch("lessonType");

  React.useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        lessonType: initialData?.lessonType || "VIDEO",
        contentReference: initialData?.contentReference || "",
      });
      setSelectedFile(null);
      setUploadMode(
        initialData?.lessonType === "VIDEO" && initialData.contentReference.startsWith("http")
          ? "url"
          : "file"
      );
    }
  }, [open, initialData, reset]);

  // Xử lý kéo thả tệp video
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn tệp video hợp lệ (MP4, MKV, WEBM)");
      return;
    }
    if (file.size > 500 * 1024 * 1024) { // Giới hạn 500MB
      toast.error("Dung lượng video tối đa được phép là 500MB");
      return;
    }

    setSelectedFile(file);
  };

  const onSubmit = async (values: FormValues) => {
    // Validate nâng cao tùy thuộc vào loại bài học
    if (values.lessonType !== "VIDEO" && !values.contentReference) {
      toast.error("Vui lòng điền nội dung tham chiếu bài học.");
      return;
    }

    if (values.lessonType === "VIDEO" && uploadMode === "url" && !values.contentReference) {
      toast.error("Vui lòng điền liên kết video.");
      return;
    }

    if (values.lessonType === "VIDEO" && uploadMode === "file" && !selectedFile && !initialData?.contentReference) {
      toast.error("Vui lòng tải lên tệp video từ máy của bạn.");
      return;
    }

    try {
      let savedLesson;

      // 1. Lưu thông tin bài học lên server trước
      if (isEdit && initialData) {
        savedLesson = await updateMutation.mutateAsync({
          id: initialData.publicId || initialData.id,
          courseId,
          data: {
            title: values.title,
            lessonType: values.lessonType,
            // Sử dụng chuỗi tạm "video_pending" khi tải lên tệp video mới để qua vòng validation của server
            contentReference: selectedFile ? "video_pending" : (values.contentReference || ""),
            sortOrder: initialData.sortOrder,
          },
        });
      } else {
        savedLesson = await createMutation.mutateAsync({
          courseId,
          data: {
            sectionId,
            title: values.title,
            lessonType: values.lessonType,
            // Sử dụng chuỗi tạm "video_pending" khi tải lên tệp video mới để qua vòng validation của server
            contentReference: selectedFile ? "video_pending" : (values.contentReference || ""),
            sortOrder: nextSortOrder,
          },
        });
      }

      // 2. Nếu có tệp video và đã lưu bài học thành công, kích hoạt tiến trình upload nền
      if (savedLesson && values.lessonType === "VIDEO" && selectedFile) {
        toast.info("Đang bắt đầu tải lên video ở chế độ chạy nền...");
        // Gọi action chạy nền của Zustand (không dùng await ở đây để dialog đóng ngay lập tức)
        startUpload(savedLesson.publicId, savedLesson.title, selectedFile, () => {
          if (onSuccess) onSuccess();
        });
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      // Đã được xử lý bởi query/mutation callback toast.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[1.5rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className={cn("h-2", isEdit ? "bg-amber-500" : "bg-indigo-600")} />

        <DialogHeader className="px-8 pt-8 text-left">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", isEdit ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600")}>
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                {isEdit ? "Cập Nhật Bài Giảng" : "Thêm Bài Giảng Mới"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic text-xs mt-0.5">
                {isEdit ? "Cập nhật tiêu đề, loại bài học và nội dung đính kèm." : "Điền thông tin dưới đây để thêm bài giảng mới."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-4">
          {/* Tên bài giảng */}
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tên bài giảng
            </Label>
            <Input
              {...register("title")}
              placeholder="VD: Bài 1: Giới thiệu khóa học"
              className={cn("h-11 rounded-xl border-slate-200", errors.title && "border-rose-500 focus-visible:ring-rose-500/10")}
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.title.message}
              </p>
            )}
          </div>

          {/* Loại bài giảng */}
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Loại bài học
            </Label>
            <Select
              disabled={isPending}
              value={lessonType}
              onValueChange={(v) => {
                setValue("lessonType", v);
                if (v !== "VIDEO") setSelectedFile(null);
              }}
            >
              <SelectTrigger className="w-full !h-11 rounded-xl border-slate-200 bg-white font-semibold">
                <SelectValue placeholder="Chọn loại bài..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="VIDEO" className="font-semibold cursor-pointer">Video (VIDEO)</SelectItem>
                <SelectItem value="DOCUMENT" className="font-semibold cursor-pointer">Tài liệu (DOCUMENT)</SelectItem>
                <SelectItem value="QUIZ" className="font-semibold cursor-pointer">Trắc nghiệm (QUIZ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Render Input tương ứng với loại bài học */}
          {lessonType === "VIDEO" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Phương thức đăng video
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={cn(
                      "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider transition-all flex items-center gap-1",
                      uploadMode === "file" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Paperclip className="w-3 h-3" /> Từ thiết bị
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={cn(
                      "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider transition-all flex items-center gap-1",
                      uploadMode === "url" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <LinkIcon className="w-3 h-3" /> Link liên kết
                  </button>
                </div>
              </div>

              {uploadMode === "file" ? (
                <div className="space-y-2">
                  <div
                    onClick={() => document.getElementById("video-file-picker")?.click()}
                    className={cn(
                      "border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-400 transition-all cursor-pointer",
                      selectedFile && "border-emerald-300 bg-emerald-50/10"
                    )}
                  >
                    <input
                      id="video-file-picker"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isPending}
                    />
                    
                    {selectedFile ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-2">
                          <Video className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 max-w-[280px] truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-xs mb-2">
                          <Video className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-600">Chọn video từ thiết bị của bạn</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Hỗ trợ MP4, MKV, WEBM (Tối đa 500MB)</p>
                      </div>
                    )}
                  </div>
                  {initialData?.contentReference && !selectedFile && (
                    <p className="text-[10px] text-slate-400 font-medium italic text-right">
                      * Đã có sẵn tệp: {initialData.contentReference.substring(initialData.contentReference.lastIndexOf("/") + 1)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <Input
                    {...register("contentReference")}
                    placeholder="VD: https://youtube.com/embed/... hoặc URL video"
                    className="h-11 rounded-xl border-slate-200"
                    disabled={isPending}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Tài liệu / Trắc nghiệm */
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nội dung tham chiếu (URL / Reference)
              </Label>
              <Input
                {...register("contentReference")}
                placeholder={lessonType === "QUIZ" ? "Nhập ID câu hỏi trắc nghiệm..." : "VD: https://docs.google.com/document/..."}
                className={cn("h-11 rounded-xl border-slate-200", errors.contentReference && "border-rose-500 focus-visible:ring-rose-500/10")}
                disabled={isPending}
              />
              {errors.contentReference && (
                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.contentReference.message}
                </p>
              )}
            </div>
          )}

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

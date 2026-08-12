"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, PlayCircle } from "lucide-react";
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
import {
  validateVideoFile,
} from "@/lib/upload-validation";
import { LessonContentField } from "./lesson-content-field";

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
  const videoFileInputId = React.useId();

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

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || "",
      lessonType: initialData?.lessonType || "VIDEO",
      contentReference: initialData?.contentReference || "",
    },
  });

  const lessonType = useWatch({ control, name: "lessonType" });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
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
  };

  // Xử lý kéo thả tệp video
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      toast.error(validation.message);
      e.currentTarget.value = "";
      return;
    }

    setSelectedFile(file);
    e.currentTarget.value = "";
  };

  const handleUploadModeChange = (mode: "file" | "url") => {
    setUploadMode(mode);
    if (mode === "url") setSelectedFile(null);
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
      if (values.lessonType === "VIDEO" && selectedFile) {
        const savedLessonId = savedLesson.publicId?.trim();
        if (!savedLessonId) {
          toast.error(
            "Đã lưu bài học nhưng chưa nhận được mã bài học để tải video. Vui lòng tải lại trang.",
          );
          setOpen(false);
          onSuccess?.();
          return;
        }

        toast.info("Đang bắt đầu tải lên video ở chế độ chạy nền...");
        // Gọi action chạy nền của Zustand (không dùng await ở đây để dialog đóng ngay lập tức)
        void startUpload(
          savedLessonId,
          savedLesson.title,
          selectedFile,
          () => onSuccess?.(),
          () => onSuccess?.(),
        );
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      // Đã được xử lý bởi query/mutation callback toast.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[1.5rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className={cn("h-2", isEdit ? "bg-amber-500" : "bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500")} />

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
              className={cn("h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500", errors.title && "border-rose-500 focus-visible:ring-rose-500/10")}
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
              <SelectTrigger className="w-full !h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Chọn loại bài..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="VIDEO" className="rounded-lg cursor-pointer py-2.5 px-3">Video (VIDEO)</SelectItem>
                <SelectItem value="DOCUMENT" className="rounded-lg cursor-pointer py-2.5 px-3">Tài liệu (DOCUMENT)</SelectItem>
                <SelectItem value="QUIZ" className="rounded-lg cursor-pointer py-2.5 px-3">Trắc nghiệm (QUIZ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <LessonContentField
            contentError={errors.contentReference?.message}
            contentRegistration={register("contentReference")}
            initialContentReference={initialData?.contentReference}
            isPending={isPending}
            lessonType={lessonType}
            selectedFile={selectedFile}
            uploadMode={uploadMode}
            videoFileInputId={videoFileInputId}
            onFileChange={handleFileChange}
            onUploadModeChange={handleUploadModeChange}
          />

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

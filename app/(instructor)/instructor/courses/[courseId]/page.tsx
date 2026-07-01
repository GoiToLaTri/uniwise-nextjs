"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Plus, Trash2, Edit3, ChevronDown, ChevronUp, 
  Layers, PlayCircle, Loader2, BookOpen, AlertCircle,
  X, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCourse } from "@/hooks/use-course";
import { useDeleteSection, useUpdateSection } from "@/hooks/use-section";
import { useDeleteLesson, useUpdateLesson } from "@/hooks/use-lesson";
import { SectionDialog } from "./_components/section-dialog";
import { LessonDialog } from "./_components/lesson-dialog";
import Link from "next/link";
import { toast } from "sonner";
import { CourseLesson } from "@/interfaces/course.interface";
import { useUploadStore } from "@/stores/upload-store";

export default function CourseCurriculumPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  // Zustand Store cho video upload chạy nền
  const uploads = useUploadStore((state) => state.uploads);
  const cancelUpload = useUploadStore((state) => state.cancelUpload);
  const removeUpload = useUploadStore((state) => state.removeUpload);
  const isUploadingAny = useUploadStore((state) => state.isUploadingAny());

  // Đăng ký cảnh báo trước khi tắt trang/reload
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploadingAny) {
        e.preventDefault();
        e.returnValue = "Đang tải video lên chạy nền. Bạn có chắc chắn muốn rời đi?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploadingAny]);

  // Lấy chi tiết khóa học kèm danh sách sections & lessons
  const { data: course, isLoading, refetch, isFetching } = useCourse(courseId);

  const deleteSectionMutation = useDeleteSection();
  const updateSectionMutation = useUpdateSection();
  const deleteLessonMutation = useDeleteLesson();
  const updateLessonMutation = useUpdateLesson();
  const [actionId, setActionId] = React.useState<string | null>(null);

  // Sắp xếp các sections theo sortOrder tăng dần
  const sortedSections = React.useMemo(() => {
    if (!course?.sections) return [];
    return [...course.sections].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [course]);

  // Xóa chương học
  const handleDeleteSection = async (sectionId: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chương học "${title}" cùng toàn bộ bài giảng bên trong?`)) {
      setActionId(sectionId);
      try {
        await deleteSectionMutation.mutateAsync({ id: sectionId, courseId });
        refetch();
      } finally {
        setActionId(null);
      }
    }
  };

  // Xóa bài giảng
  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài giảng "${title}"?`)) {
      setActionId(lessonId);
      try {
        await deleteLessonMutation.mutateAsync({ id: lessonId, courseId });
        refetch();
      } finally {
        setActionId(null);
      }
    }
  };

  // Hoán đổi sortOrder của hai Lesson (Di chuyển lên/xuống)
  const handleMoveLesson = async (
    sectionLessons: CourseLesson[],
    index: number,
    direction: "up" | "down"
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionLessons.length) return;

    const currentLesson = sectionLessons[index];
    const targetLesson = sectionLessons[targetIndex];

    const currentOrder = currentLesson.sortOrder;
    const targetOrder = targetLesson.sortOrder;

    const tempTargetOrder = currentOrder === targetOrder ? targetOrder + (direction === "up" ? -1 : 1) : targetOrder;

    setActionId(currentLesson.publicId || currentLesson.id);
    try {
      await Promise.all([
        updateLessonMutation.mutateAsync({
          id: currentLesson.publicId || currentLesson.id,
          courseId,
          data: {
            title: currentLesson.title,
            lessonType: currentLesson.lessonType,
            contentReference: currentLesson.contentReference,
            sortOrder: tempTargetOrder,
          },
        }),
        updateLessonMutation.mutateAsync({
          id: targetLesson.publicId || targetLesson.id,
          courseId,
          data: {
            title: targetLesson.title,
            lessonType: targetLesson.lessonType,
            contentReference: targetLesson.contentReference,
            sortOrder: currentOrder,
          },
        }),
      ]);
      refetch();
    } catch {
      toast.error("Không thể thay đổi vị trí bài giảng");
    } finally {
      setActionId(null);
    }
  };

  // Hoán đổi sortOrder của hai Section (Di chuyển lên/xuống)
  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedSections.length) return;

    const currentSection = sortedSections[index];
    const targetSection = sortedSections[targetIndex];

    // Hoán đổi sortOrder thực tế
    const currentOrder = currentSection.sortOrder;
    const targetOrder = targetSection.sortOrder;

    // Tránh trùng lặp sortOrder nếu backend so sánh nghiêm ngặt
    const tempTargetOrder = currentOrder === targetOrder ? targetOrder + (direction === "up" ? -1 : 1) : targetOrder;

    setActionId(currentSection.publicId || currentSection.id);
    try {
      await Promise.all([
        updateSectionMutation.mutateAsync({
          id: currentSection.publicId || currentSection.id,
          courseId,
          data: { title: currentSection.title, sortOrder: tempTargetOrder },
        }),
        updateSectionMutation.mutateAsync({
          id: targetSection.publicId || targetSection.id,
          courseId,
          data: { title: targetSection.title, sortOrder: currentOrder },
        }),
      ]);
      refetch();
    } catch {
      toast.error("Không thể thay đổi vị trí chương học");
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-6 w-32 rounded-md bg-slate-100" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-3/4 rounded-xl bg-slate-100" />
          <Skeleton className="h-8 w-1/2 rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500" />
        <h3 className="text-xl font-black text-slate-900">Không tìm thấy khóa học</h3>
        <p className="text-slate-500 italic max-w-sm">Liên kết không tồn tại hoặc bạn không có quyền chỉnh sửa khóa học này.</p>
        <Link href="/instructor/courses">
          <Button className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white">
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce(
    (total, sec) => total + (sec.lessons?.length || 0), 0
  ) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* 1. Header Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/instructor/courses">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Button>
        </Link>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Quay lại danh sách khóa học
        </span>
      </div>

      {/* 2. Course Meta Summary Card */}
      <Card className="p-6 md:p-8 rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(79,70,229,0.02)] flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                <BookOpen className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="space-y-1 text-left">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug line-clamp-2">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <Badge variant="outline" className={cn(
                "px-2.5 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest border",
                course.status === "PUBLISHED" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-600 bg-slate-100 border-slate-200"
              )}>
                {course.status === "PUBLISHED" ? "Công khai" : "Bản nháp"}
              </Badge>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Layers className="w-4 h-4 text-indigo-400" /> {course.sections?.length || 0} chương
              </span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <PlayCircle className="w-4 h-4 text-blue-400" /> {totalLessons} bài học
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 justify-end">
          <SectionDialog courseId={courseId} courseDbId={course.id} nextSortOrder={sortedSections.length} onSuccess={refetch}>
            <Button className="h-11 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              THÊM CHƯƠNG MỚI
            </Button>
          </SectionDialog>
        </div>
      </Card>

      {/* 3. Main Sections List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Giáo trình chi tiết
          </h2>
          {isFetching && (
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 italic animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang cập nhật dữ liệu...
            </span>
          )}
        </div>

        {sortedSections.length === 0 ? (
          <div className="bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 p-16 flex flex-col justify-center items-center text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Khóa học chưa có chương học nào</h3>
            <p className="text-xs text-slate-400 italic mt-1 max-w-xs">
              Bắt đầu tạo khung giáo trình bằng cách thêm chương học đầu tiên.
            </p>
            <SectionDialog courseId={courseId} courseDbId={course.id} nextSortOrder={0} onSuccess={refetch}>
              <Button variant="outline" className="mt-6 rounded-xl font-bold border-slate-200 bg-white hover:bg-slate-50">
                Thêm chương đầu tiên
              </Button>
            </SectionDialog>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSections.map((section, index) => {
              const isActionPending = actionId === (section.publicId || section.id);
              return (
                <Card 
                  key={section.id} 
                  className={cn(
                    "overflow-hidden border border-slate-200 bg-white rounded-2xl transition-all duration-300",
                    isActionPending && "opacity-60 pointer-events-none"
                  )}
                >
                  {/* Section Title Header */}
                  <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                        <span className="text-xs font-black uppercase tracking-wider">CHƯƠNG {index + 1}</span>
                      </div>
                      <h3 className="font-black text-slate-800 tracking-tight leading-snug">
                        {section.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Sắp xếp vị trí */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveSection(index, "up")}
                        disabled={index === 0 || isActionPending}
                        className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveSection(index, "down")}
                        disabled={index === sortedSections.length - 1 || isActionPending}
                        className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>

                      <div className="w-px h-4 bg-slate-200 mx-1" />

                      {/* Quản lý Section */}
                      <SectionDialog 
                        courseId={courseId} 
                        courseDbId={course.id}
                        initialData={{
                          id: section.id,
                          publicId: section.publicId,
                          title: section.title,
                          sortOrder: section.sortOrder
                        }}
                        onSuccess={refetch}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-slate-500"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </SectionDialog>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSection(section.publicId || section.id, section.title)}
                        className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Section Lessons Block */}
                  <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider pb-2 border-b border-slate-50">
                      <span>Danh sách bài giảng ({section.lessons?.length || 0})</span>
                      <LessonDialog 
                        courseId={courseId} 
                        sectionId={section.id} 
                        nextSortOrder={section.lessons?.length || 0} 
                        onSuccess={refetch}
                      >
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 rounded-lg text-[10px] font-black text-indigo-600 hover:bg-indigo-50/50 uppercase tracking-widest flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          Thêm bài giảng
                        </Button>
                      </LessonDialog>
                    </div>

                    {!section.lessons || section.lessons.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium italic text-center py-4">
                        Chưa có bài giảng nào trong chương này.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {[...section.lessons]
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((lesson, idx, arr) => {
                            const isLessonPending = actionId === (lesson.publicId || lesson.id);
                            return (
                              <div 
                                key={lesson.id} 
                                className={cn(
                                  "p-3.5 rounded-xl border border-slate-100 hover:border-indigo-50/50 hover:bg-slate-50/10 transition-all flex items-center justify-between gap-4",
                                  isLessonPending && "opacity-55 pointer-events-none"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-slate-300 w-5 text-right">{idx + 1}.</span>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-700">{lesson.title}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="px-1.5 py-0 rounded-md text-[8px] font-black uppercase text-indigo-500 bg-indigo-50/50 border-indigo-100">
                                        {lesson.lessonType}
                                      </Badge>
                                      <span className="text-[10px] text-slate-400 font-semibold line-clamp-1 italic max-w-[200px] md:max-w-[400px]">
                                        {lesson.contentReference || "Chưa thiết lập nội dung"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {/* Di chuyển bài giảng */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveLesson(arr, idx, "up")}
                                    disabled={idx === 0 || isLessonPending}
                                    className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveLesson(arr, idx, "down")}
                                    disabled={idx === arr.length - 1 || isLessonPending}
                                    className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </Button>

                                  <div className="w-px h-3 bg-slate-200 mx-0.5" />

                                  {/* Sửa bài giảng */}
                                  <LessonDialog
                                    courseId={courseId}
                                    sectionId={section.id}
                                    initialData={lesson}
                                    onSuccess={refetch}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-slate-400"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                  </LessonDialog>

                                  {/* Xóa bài giảng */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteLesson(lesson.publicId || lesson.id, lesson.title)}
                                    className="h-7 w-7 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Floating Background Uploads Monitor Panel */}
      {Object.keys(uploads).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className={cn("w-4 h-4 text-indigo-600", isUploadingAny && "animate-spin")} />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Tiến trình tải lên video
              </span>
            </div>
            <Badge variant="outline" className="px-1.5 py-0 rounded bg-indigo-50 text-indigo-600 font-bold text-[9px]">
              {Object.values(uploads).filter(u => u.status === "uploading").length} Đang tải
            </Badge>
          </div>
          <div className="p-4 space-y-3.5 max-h-[300px] overflow-y-auto">
            {Object.values(uploads).map((item) => {
              const statusColors = {
                uploading: "bg-indigo-600",
                completed: "bg-emerald-500",
                failed: "bg-rose-500",
                canceled: "bg-slate-400",
              };
              
              const isUploading = item.status === "uploading";

              return (
                <div key={item.lessonId} className="space-y-2 p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-700 line-clamp-1">
                        {item.lessonTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[240px]">
                        {item.fileName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isUploading ? (
                        <>
                          <span className="text-[10px] font-black text-indigo-600">{item.progress}%</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const confirmCancel = window.confirm(`Bạn có chắc chắn muốn dừng tải lên video cho bài học "${item.lessonTitle}"?`);
                              if (confirmCancel) cancelUpload(item.lessonId);
                            }}
                            className="h-6 w-6 rounded-md hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {item.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {item.status === "failed" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                          {item.status === "canceled" && <XCircle className="w-4 h-4 text-slate-400" />}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUpload(item.lessonId)}
                            className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tiến độ và lỗi nếu có */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-300", statusColors[item.status])}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.error && (
                      <p className="text-[9px] font-bold text-rose-500 line-clamp-1 mt-1">
                        Lỗi: {item.error}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

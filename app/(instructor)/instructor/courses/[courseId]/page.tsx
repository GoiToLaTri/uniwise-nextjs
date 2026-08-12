"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-course";
import { useDeleteLesson, useReorderLessons } from "@/hooks/use-lesson";
import { useDeleteSection, useReorderSections } from "@/hooks/use-section";
import { type CourseSection } from "@/interfaces/course.interface";
import { useUploadStore } from "@/stores/upload-store";
import { CourseCurriculumSummary } from "./_components/course-curriculum-summary";
import { CurriculumSectionList } from "./_components/curriculum-section-list";
import { OrderSavePanel } from "./_components/order-save-panel";
import { UploadMonitor } from "./_components/upload-monitor";

type MoveDirection = "up" | "down";

function sortSections(sections: CourseSection[]) {
  return [...sections]
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .map((section) => ({
      ...section,
      lessons: [...section.lessons].sort(
        (first, second) => first.sortOrder - second.sortOrder,
      ),
    }));
}

export default function CourseCurriculumPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const uploads = useUploadStore((state) => state.uploads);
  const cancelUpload = useUploadStore((state) => state.cancelUpload);
  const removeUpload = useUploadStore((state) => state.removeUpload);
  const isUploadingAny = useUploadStore((state) => state.isUploadingAny());
  const { data: course, isLoading, refetch, isFetching } = useCourse(courseId);
  const deleteSectionMutation = useDeleteSection();
  const reorderSectionsMutation = useReorderSections();
  const deleteLessonMutation = useDeleteLesson();
  const reorderLessonsMutation = useReorderLessons();
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [draftSections, setDraftSections] = React.useState<CourseSection[] | null>(null);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);

  const serverSections = React.useMemo(
    () => sortSections(course?.sections ?? []),
    [course?.sections],
  );
  const localSections = draftSections ?? serverSections;
  const isOrderChanged = draftSections !== null;

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isUploadingAny) {
        event.preventDefault();
        event.returnValue = "Đang tải video lên chạy nền. Bạn có chắc chắn muốn rời đi?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploadingAny]);

  const handleDeleteSection = async (sectionId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chương học "${title}" cùng toàn bộ bài giảng bên trong?`)) return;

    setActionId(sectionId);
    try {
      await deleteSectionMutation.mutateAsync({ id: sectionId, courseId });
      setDraftSections(null);
      await refetch();
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài giảng "${title}"?`)) return;

    setActionId(lessonId);
    try {
      await deleteLessonMutation.mutateAsync({ id: lessonId, courseId });
      setDraftSections(null);
      await refetch();
    } finally {
      setActionId(null);
    }
  };

  const handleMoveLesson = (
    sectionIndex: number,
    lessonIndex: number,
    direction: MoveDirection,
  ) => {
    setDraftSections((currentDraft) => {
      const nextSections = [...(currentDraft ?? serverSections)];
      const section = nextSections[sectionIndex];
      const targetIndex = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;

      if (!section || targetIndex < 0 || targetIndex >= section.lessons.length) {
        return currentDraft;
      }

      const nextLessons = [...section.lessons];
      [nextLessons[lessonIndex], nextLessons[targetIndex]] = [
        nextLessons[targetIndex],
        nextLessons[lessonIndex],
      ];

      nextSections[sectionIndex] = {
        ...section,
        lessons: nextLessons.map((lesson, index) => ({
          ...lesson,
          sortOrder: index + 1,
        })),
      };

      return nextSections;
    });
  };

  const handleMoveSection = (sectionIndex: number, direction: MoveDirection) => {
    setDraftSections((currentDraft) => {
      const nextSections = [...(currentDraft ?? serverSections)];
      const targetIndex = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;

      if (targetIndex < 0 || targetIndex >= nextSections.length) {
        return currentDraft;
      }

      [nextSections[sectionIndex], nextSections[targetIndex]] = [
        nextSections[targetIndex],
        nextSections[sectionIndex],
      ];

      return nextSections.map((section, index) => ({
        ...section,
        sortOrder: index + 1,
      }));
    });
  };

  const handleSaveOrder = async () => {
    if (!course) return;

    setIsSavingOrder(true);

    try {
      const reorderRequests: Promise<boolean>[] = [
        reorderSectionsMutation.mutateAsync({
          courseDbId: course.id,
          courseId,
          data: {
            items: localSections.map((section) => ({
              id: section.publicId || section.id,
              sortOrder: section.sortOrder,
            })),
          },
        }),
      ];

      localSections.forEach((section) => {
        if (section.lessons.length > 0) {
          reorderRequests.push(
            reorderLessonsMutation.mutateAsync({
              courseId,
              sectionDbId: section.id,
              data: {
                items: section.lessons.map((lesson) => ({
                  id: lesson.publicId || lesson.id,
                  sortOrder: lesson.sortOrder,
                })),
              },
            }),
          );
        }
      });

      await Promise.all(reorderRequests);
      const refreshedCourse = await refetch();

      if (refreshedCourse.isError) {
        throw refreshedCourse.error;
      }

      setDraftSections(null);
      toast.success("Đã lưu thứ tự mới thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi lưu thứ tự.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleRefresh = () => {
    setDraftSections(null);
    void refetch();
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
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl bg-slate-100" />
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
          <Button className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <CourseCurriculumSummary
        course={course}
        courseId={courseId}
        sectionCount={localSections.length}
        onRefresh={handleRefresh}
      />
      <CurriculumSectionList
        actionId={actionId}
        courseDbId={course.id}
        courseId={courseId}
        isFetching={isFetching}
        sections={localSections}
        onDeleteLesson={handleDeleteLesson}
        onDeleteSection={handleDeleteSection}
        onMoveLesson={handleMoveLesson}
        onMoveSection={handleMoveSection}
        onRefresh={handleRefresh}
      />
      {isOrderChanged && (
        <OrderSavePanel
          isSaving={isSavingOrder}
          onCancel={() => setDraftSections(null)}
          onSave={handleSaveOrder}
        />
      )}
      <UploadMonitor
        uploads={uploads}
        isUploadingAny={isUploadingAny}
        onCancel={cancelUpload}
        onRemove={removeUpload}
      />
    </div>
  );
}

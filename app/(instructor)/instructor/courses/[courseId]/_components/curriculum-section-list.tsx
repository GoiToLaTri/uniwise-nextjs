"use client";

import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Layers,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type CourseSection } from "@/interfaces/course.interface";
import { cn } from "@/lib/utils";
import { LessonDialog } from "./lesson-dialog";
import { SectionDialog } from "./section-dialog";

type MoveDirection = "up" | "down";

interface CurriculumSectionListProps {
  actionId: string | null;
  courseDbId: string;
  courseId: string;
  isFetching: boolean;
  sections: CourseSection[];
  onDeleteLesson: (lessonId: string, title: string) => void;
  onDeleteSection: (sectionId: string, title: string) => void;
  onMoveLesson: (sectionIndex: number, lessonIndex: number, direction: MoveDirection) => void;
  onMoveSection: (sectionIndex: number, direction: MoveDirection) => void;
  onRefresh: () => void;
}

export function CurriculumSectionList({
  actionId,
  courseDbId,
  courseId,
  isFetching,
  sections,
  onDeleteLesson,
  onDeleteSection,
  onMoveLesson,
  onMoveSection,
  onRefresh,
}: CurriculumSectionListProps) {
  return (
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

      {sections.length === 0 ? (
        <div className="bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 p-16 flex flex-col justify-center items-center text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Khóa học chưa có chương học nào</h3>
          <p className="text-xs text-slate-400 italic mt-1 max-w-xs">
            Bắt đầu tạo khung giáo trình bằng cách thêm chương học đầu tiên.
          </p>
          <SectionDialog courseId={courseId} courseDbId={courseDbId} nextSortOrder={0} onSuccess={onRefresh}>
            <Button variant="outline" className="mt-6 rounded-xl font-bold border-slate-200 bg-white hover:bg-slate-50">
              Thêm chương đầu tiên
            </Button>
          </SectionDialog>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const sectionId = section.publicId || section.id;
            const isActionPending = actionId === sectionId;

            return (
              <Card
                key={section.id}
                className={cn(
                  "overflow-hidden border border-slate-200 bg-white rounded-2xl transition-all duration-300",
                  isActionPending && "opacity-60 pointer-events-none",
                )}
              >
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                      <span className="text-xs font-black uppercase tracking-wider">CHƯƠNG {sectionIndex + 1}</span>
                    </div>
                    <h3 className="font-black text-slate-800 tracking-tight leading-snug">{section.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveSection(sectionIndex, "up")}
                      disabled={sectionIndex === 0 || isActionPending}
                      className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveSection(sectionIndex, "down")}
                      disabled={sectionIndex === sections.length - 1 || isActionPending}
                      className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <SectionDialog
                      courseId={courseId}
                      courseDbId={courseDbId}
                      initialData={{
                        id: section.id,
                        publicId: section.publicId,
                        title: section.title,
                        sortOrder: section.sortOrder,
                      }}
                      onSuccess={onRefresh}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-slate-500">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </SectionDialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteSection(sectionId, section.title)}
                      className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider pb-2 border-b border-slate-50">
                    <span>Danh sách bài giảng ({section.lessons.length})</span>
                    <LessonDialog
                      courseId={courseId}
                      sectionId={section.id}
                      nextSortOrder={section.lessons.length}
                      onSuccess={onRefresh}
                    >
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 rounded-lg text-[10px] font-black text-indigo-600 hover:bg-indigo-50/50 uppercase tracking-widest flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Thêm bài giảng
                      </Button>
                    </LessonDialog>
                  </div>

                  {section.lessons.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium italic text-center py-4">
                      Chưa có bài giảng nào trong chương này.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {section.lessons.map((lesson, lessonIndex) => {
                        const lessonId = lesson.publicId || lesson.id;
                        const isLessonPending = actionId === lessonId;

                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "p-3.5 rounded-xl border border-slate-100 hover:border-indigo-50/50 hover:bg-slate-50/10 transition-all flex items-center justify-between gap-4",
                              isLessonPending && "opacity-55 pointer-events-none",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-300 w-5 text-right">{lessonIndex + 1}.</span>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onMoveLesson(sectionIndex, lessonIndex, "up")}
                                disabled={lessonIndex === 0 || isLessonPending}
                                className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onMoveLesson(sectionIndex, lessonIndex, "down")}
                                disabled={lessonIndex === section.lessons.length - 1 || isLessonPending}
                                className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </Button>
                              <div className="w-px h-3 bg-slate-200 mx-0.5" />
                              <LessonDialog courseId={courseId} sectionId={section.id} initialData={lesson} onSuccess={onRefresh}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-slate-400">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                              </LessonDialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteLesson(lessonId, lesson.title)}
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
  );
}

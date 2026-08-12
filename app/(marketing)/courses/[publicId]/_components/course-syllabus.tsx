"use client";

import { CheckCircle, ChevronDown, ChevronUp, FileText, Lock, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type CourseLesson, type CourseSection } from "@/interfaces/course.interface";

interface CourseSyllabusProps {
  expandedSections: Record<string, boolean> | null;
  isEnrolled: boolean;
  sections: CourseSection[];
  totalLessons: number;
  onExpandedSectionsChange: (sections: Record<string, boolean>) => void;
  onLessonOpen: (lesson: CourseLesson) => void;
  onSectionToggle: (sectionId: string) => void;
}

export function CourseSyllabus({
  expandedSections,
  isEnrolled,
  sections,
  totalLessons,
  onExpandedSectionsChange,
  onLessonOpen,
  onSectionToggle,
}: CourseSyllabusProps) {
  const areAllExpanded =
    sections.length > 0 &&
    sections.every((section, sectionIndex) =>
      expandedSections === null
        ? sectionIndex === 0
        : expandedSections[section.id] === true,
    );

  const handleToggleAll = () => {
    if (areAllExpanded) {
      onExpandedSectionsChange({});
      return;
    }

    onExpandedSectionsChange(
      Object.fromEntries(sections.map((section) => [section.id, true])),
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nội dung chương trình học</h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">{sections.length} chương • {totalLessons} bài học</p>
        </div>
        <button onClick={handleToggleAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
          {areAllExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
        </button>
      </div>

      <div className="space-y-3">
        {sections.length > 0 ? (
          sections.map((section, sectionIndex) => {
            const isExpanded = expandedSections === null
              ? sectionIndex === 0
              : expandedSections[section.id] === true;

            return (
              <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => onSectionToggle(section.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-100/50 hover:bg-slate-100 transition-colors cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">{sectionIndex + 1}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">{section.title}</h3>
                      <span className="text-slate-500 text-xs font-semibold">{section.lessons.length} bài giảng</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>

                {isExpanded && (
                  <div className="bg-white border-t border-slate-150 divide-y divide-slate-100 animate-in slide-in-from-top-1 duration-200">
                    {section.lessons.length > 0 ? (
                      section.lessons.map((lesson, lessonIndex) => (
                        <button
                          type="button"
                          key={lesson.id}
                          onClick={() => onLessonOpen(lesson)}
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            {lesson.isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : lesson.lessonType === "VIDEO" ? (
                              <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                            )}
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                              Bài {lessonIndex + 1}: {lesson.title}
                            </span>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {isEnrolled ? (
                              <span className="text-xs font-bold text-indigo-600 group-hover:underline">Học ngay</span>
                            ) : lesson.isPreview ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-100 font-bold px-2 py-0.5 text-[10px]">Học thử</Badge>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs font-semibold">Chương học này chưa được cập nhật bài giảng.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">Chương trình học hiện đang được cập nhật.</div>
        )}
      </div>
    </div>
  );
}

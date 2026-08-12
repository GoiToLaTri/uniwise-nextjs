"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, PlayCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RemoteImage } from "@/components/shared/remote-image";
import { type CourseResponse } from "@/interfaces/course.interface";
import { cn } from "@/lib/utils";
import { SectionDialog } from "./section-dialog";

interface CourseCurriculumSummaryProps {
  course: CourseResponse;
  courseId: string;
  sectionCount: number;
  onRefresh: () => void;
}

export function CourseCurriculumSummary({
  course,
  courseId,
  sectionCount,
  onRefresh,
}: CourseCurriculumSummaryProps) {
  const totalLessons = course.sections.reduce(
    (total, section) => total + section.lessons.length,
    0,
  );

  return (
    <>
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

      <Card className="p-6 md:p-8 rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(79,70,229,0.02)] flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
            {course.thumbnailUrl ? (
              <RemoteImage
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                sizes="96px"
                className="object-cover"
              />
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
              <Badge
                variant="outline"
                className={cn(
                  "px-2.5 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest border",
                  course.status === "PUBLISHED"
                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                    : "text-slate-600 bg-slate-100 border-slate-200",
                )}
              >
                {course.status === "PUBLISHED" ? "Công khai" : "Bản nháp"}
              </Badge>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Layers className="w-4 h-4 text-indigo-400" /> {sectionCount} chương
              </span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <PlayCircle className="w-4 h-4 text-blue-400" /> {totalLessons} bài học
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 justify-end">
          <SectionDialog
            courseId={courseId}
            courseDbId={course.id}
            nextSortOrder={sectionCount}
            onSuccess={onRefresh}
          >
            <Button className="h-11 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              THÊM CHƯƠNG MỚI
            </Button>
          </SectionDialog>
        </div>
      </Card>
    </>
  );
}

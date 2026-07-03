"use client";

import * as React from "react";
import { usePublishedCourses } from "@/hooks/use-course";
import { usePriceTiers } from "@/hooks/use-price-tier";
import { CourseCard } from "../../../_components/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

interface InstructorCoursesProps {
  accountId: string;
}

export function InstructorCourses({ accountId }: InstructorCoursesProps) {
  const { data: coursesData, isLoading: isLoadingCourses } = usePublishedCourses(0, 100);
  const { data: priceTiersData, isLoading: isLoadingTiers } = usePriceTiers(0, 100);

  const isLoading = isLoadingCourses || isLoadingTiers;
  const courses = coursesData?.content || [];
  const priceTiers = priceTiersData?.content || [];

  const instructorCourses = React.useMemo(() => {
    return courses.filter((c) => c.creatorId === accountId);
  }, [courses, accountId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border border-slate-200 rounded-xl overflow-hidden p-6 space-y-4 bg-white/90">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-4 flex justify-between items-center">
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (instructorCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 bg-white border border-slate-200 border-dashed rounded-2xl p-8 gap-4 shadow-xs">
        <BookOpen className="w-12 h-12 text-slate-300 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-800">Chưa có khóa học nào</h3>
        <p className="text-slate-500 text-sm font-semibold max-w-sm">
          Giảng viên này hiện chưa có khóa học nào được xuất bản hoặc công khai trên hệ thống.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {instructorCourses.map((course) => (
        <CourseCard key={course.id} course={course} priceTiers={priceTiers} />
      ))}
    </div>
  );
}
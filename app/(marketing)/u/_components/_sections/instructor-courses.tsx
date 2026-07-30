"use client";

import * as React from "react";
import { useSearchPublishedCourses } from "@/hooks/use-search";
import { usePriceTiers } from "@/hooks/use-price-tier";
import { CourseCard } from "../../../_components/course-card";
import { CoursesPagination } from "../../../courses/_components/courses-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen } from "lucide-react";

interface InstructorCoursesProps {
  profilePublicId: string;
}

export function InstructorCourses({ profilePublicId }: InstructorCoursesProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 9;
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    isError: isErrorCourses,
  } = useSearchPublishedCourses(
    "",
    currentPage,
    pageSize,
    true,
    profilePublicId,
  );
  const {
    data: priceTiersData,
    isLoading: isLoadingTiers,
    isError: isErrorTiers,
  } = usePriceTiers(0, 100);

  const isLoading = isLoadingCourses || isLoadingTiers;
  const isError = isErrorCourses || isErrorTiers;
  const priceTiers = priceTiersData?.content || [];
  const instructorCourses = coursesData?.content || [];
  const totalElements = coursesData?.totalElements || 0;
  const totalPages = coursesData?.totalPages || 0;

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

  if (isError) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-8 py-16 text-center animate-in fade-in duration-500">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="text-lg font-bold text-slate-900">
          Không thể tải khóa học
        </h3>
        <p className="text-sm font-semibold text-slate-600">
          Vui lòng tải lại trang hoặc thử lại sau.
        </p>
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
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-500 md:grid-cols-2 lg:grid-cols-3">
        {instructorCourses.map((course) => (
          <CourseCard
            key={course.publicId}
            course={course}
            priceTiers={priceTiers}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <CoursesPagination
          pageNumber={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

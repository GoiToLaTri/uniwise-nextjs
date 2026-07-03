"use client";

import * as React from "react";
import { CourseCard } from "../_components/course-card";
import { usePublishedCourses } from "@/hooks/use-course";
import { usePriceTiers } from "@/hooks/use-price-tier";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CoursesPagination } from "./_components/courses-pagination";
import { Search, BookOpen, AlertCircle } from "lucide-react";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 9;

  // Tải danh sách khóa học và bảng định giá với dung lượng lớn để hỗ trợ tìm kiếm client-side tốt hơn
  const { data: coursesData, isLoading: isLoadingCourses, isError: isErrorCourses } = usePublishedCourses(0, 100);
  const { data: priceTiersData, isLoading: isLoadingTiers } = usePriceTiers(0, 100);

  const isLoading = isLoadingCourses || isLoadingTiers;
  const isError = isErrorCourses;

  const courses = coursesData?.content || [];
  const priceTiers = priceTiersData?.content || [];

  // Tìm kiếm khóa học phía Client
  const filteredCourses = React.useMemo(() => {
    if (!searchQuery.trim()) return courses;
    return courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [courses, searchQuery]);

  // Reset trang về 0 khi từ khóa tìm kiếm thay đổi
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // Phân trang dữ liệu sau khi lọc
  const totalElements = filteredCourses.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const paginatedCourses = React.useMemo(() => {
    const start = currentPage * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 flex flex-col gap-12 animate-in fade-in duration-700">
      {/* Header giới thiệu */}
      <div className="flex flex-col gap-6 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Danh mục khóa học
        </h1>
        <p className="text-slate-600 font-semibold text-lg leading-relaxed">
          Khám phá các khóa học trực tuyến chất lượng cao từ các chuyên gia tại UniWise. Tìm kiếm và bắt đầu nâng cao kiến thức của bạn ngay hôm nay.
        </p>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Input
          type="text"
          placeholder="Tìm kiếm tên khóa học hoặc mô tả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
        />
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
      </div>

      {/* Danh sách khóa học */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {Array.from({ length: 6 }).map((_, index) => (
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
      ) : isError ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-rose-50/50 rounded-2xl border border-rose-100 p-8 gap-3 max-w-xl mx-auto animate-in fade-in duration-500">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h3 className="text-xl font-bold text-slate-900">Đã xảy ra lỗi</h3>
          <p className="text-slate-600 font-semibold">Không thể tải danh sách khóa học. Vui lòng tải lại trang hoặc thử lại sau.</p>
        </div>
      ) : paginatedCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 gap-4 animate-in fade-in duration-500">
          <BookOpen className="w-16 h-16 text-indigo-300" />
          <h3 className="text-xl font-bold text-slate-900">Không tìm thấy khóa học nào</h3>
          <p className="text-slate-500 font-semibold max-w-md">
            {searchQuery.trim()
              ? `Không tìm thấy khóa học nào khớp với từ khóa "${searchQuery}". Thử tìm kiếm với từ khóa khác.`
              : "Danh mục khóa học hiện đang trống hoặc chưa có khóa học nào được xuất bản."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {paginatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} priceTiers={priceTiers} />
            ))}
          </div>

          {/* Phân trang */}
          {totalElements > 0 && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <CoursesPagination
                pageNumber={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

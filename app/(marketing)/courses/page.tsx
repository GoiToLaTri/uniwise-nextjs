"use client";

import * as React from "react";
import { CourseCard } from "../_components/course-card";
import { useSearchPublishedCourses } from "@/hooks/use-search";
import { usePriceTiers } from "@/hooks/use-price-tier";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CoursesPagination } from "./_components/courses-pagination";
import { Search, BookOpen, AlertCircle } from "lucide-react";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [submittedSearch, setSubmittedSearch] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 9;

  // Lấy dữ liệu cho Autocomplete (chỉ khi có text)
  const { data: autocompleteData, isLoading: isLoadingAutocomplete } = useSearchPublishedCourses(
    debouncedSearch, 0, 5, debouncedSearch.trim().length > 0
  );

  // Lấy danh sách khóa học chính (sử dụng 100% search-service)
  const { data: coursesData, isLoading: isLoadingCourses, isError: isErrorCourses } = useSearchPublishedCourses(
    submittedSearch, currentPage, pageSize, true
  );

  const { data: priceTiersData, isLoading: isLoadingTiers } = usePriceTiers(0, 100);

  const isLoading = isLoadingCourses || isLoadingTiers;
  const isError = isErrorCourses;

  const autocompleteCourses = autocompleteData?.content || [];
  const courses = coursesData?.content || [];
  const totalElements = coursesData?.totalElements || 0;
  const totalPages = coursesData?.totalPages || 0;
  const priceTiers = priceTiersData?.content || [];

  const submitSearch = (keyword: string) => {
    setSubmittedSearch(keyword);
    setCurrentPage(0);
    setIsFocused(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      submitSearch(searchQuery);
      event.currentTarget.blur();
    }
  };

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
      <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-2 duration-500 z-10">
        <Input
          type="text"
          placeholder="Tìm kiếm tên khóa học hoặc mô tả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="pl-10 h-11 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-xs focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
        />
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" 
          onClick={() => submitSearch(searchQuery)}
        />
        
        {/* Autocomplete Dropdown */}
        {isFocused && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            {isLoadingAutocomplete ? (
              <div className="p-4 text-center text-slate-500 text-sm font-medium">Đang tìm kiếm...</div>
            ) : autocompleteCourses.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm font-medium">Không tìm thấy kết quả</div>
            ) : (
              <ul className="max-h-[300px] overflow-y-auto">
                {autocompleteCourses.map(course => (
                  <li key={course.publicId}>
                    <div
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none cursor-pointer group"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Ngăn mất focus khi click
                        setSearchQuery(course.title);
                        submitSearch(course.title);
                      }}
                    >
                      <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
                          {course.title}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 gap-4 animate-in fade-in duration-500">
          <BookOpen className="w-16 h-16 text-indigo-300" />
          <h3 className="text-xl font-bold text-slate-900">Không tìm thấy khóa học nào</h3>
          <p className="text-slate-500 font-semibold max-w-md">
            {submittedSearch.trim()
              ? `Không tìm thấy khóa học nào khớp với từ khóa "${submittedSearch}". Thử tìm kiếm với từ khóa khác.`
              : "Danh mục khóa học hiện đang trống hoặc chưa có khóa học nào được xuất bản."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {courses.map((course) => (
              <CourseCard key={course.publicId} course={course} priceTiers={priceTiers} />
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

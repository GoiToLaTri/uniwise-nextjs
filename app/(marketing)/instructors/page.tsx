"use client";

import * as React from "react";
import { InstructorCard } from "./_components/instructor-card";
import { InstructorsPagination } from "./_components/instructors-pagination";
import { usePublicInstructors } from "@/hooks/use-instructor";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, AlertCircle } from "lucide-react";

export default function InstructorsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [submittedSearch, setSubmittedSearch] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 9; // Hiển thị 9 giảng viên mỗi trang

  // Tải một nhóm kết quả nhỏ để gợi ý trong autocomplete.
  const {
    data: autocompleteData,
    isLoading: isLoadingAutocomplete,
  } = usePublicInstructors(
    0,
    5,
    debouncedSearch,
    debouncedSearch.trim().length > 0,
  );

  // Search-service chỉ trả instructor APPROVED và dữ liệu được phép công khai.
  const { data: instructorsData, isLoading, isError } = usePublicInstructors(
    currentPage,
    pageSize,
    submittedSearch,
  );

  const autocompleteInstructors = autocompleteData?.content || [];
  const instructors = instructorsData?.content || [];
  const totalElements = instructorsData?.totalElements || 0;
  const totalPages = instructorsData?.totalPages || 0;

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
          Đội ngũ giảng viên
        </h1>
        <p className="text-slate-600 font-semibold text-lg leading-relaxed">
          Gặp gỡ đội ngũ giảng viên xuất sắc tại UniWise. Những chuyên gia hàng đầu luôn sẵn sàng đồng hành và truyền tải kiến thức thực tiễn đến bạn.
        </p>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Input
          type="text"
          placeholder="Tìm theo tên, chuyên môn hoặc kinh nghiệm..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="pl-10 h-11 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-xs focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
        />
        <Search
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-indigo-600"
          onClick={() => submitSearch(searchQuery)}
        />

        {/* Autocomplete Dropdown */}
        {isFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2">
            {isLoadingAutocomplete ? (
              <div className="p-4 text-center text-sm font-medium text-slate-500">
                Đang tìm kiếm...
              </div>
            ) : autocompleteInstructors.length === 0 ? (
              <div className="p-4 text-center text-sm font-medium text-slate-500">
                Không tìm thấy kết quả
              </div>
            ) : (
              <ul className="max-h-[300px] overflow-y-auto">
                {autocompleteInstructors.map((instructor) => {
                  const displayName =
                    instructor.professionalName || instructor.name;
                  const supportingText =
                    instructor.professionalName &&
                    instructor.professionalName !== instructor.name
                      ? instructor.name
                      : instructor.expertises[0]?.name;

                  return (
                    <li key={instructor.publicId}>
                      <div
                        className="group flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 transition-colors last:border-none hover:bg-slate-50"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setSearchQuery(displayName);
                          submitSearch(displayName);
                        }}
                      >
                        <Search className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-700 transition-colors group-hover:text-indigo-700">
                            {displayName}
                          </p>
                          {supportingText && (
                            <p className="truncate text-xs font-medium text-slate-400">
                              {supportingText}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Danh sách giảng viên */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden p-6 space-y-5 bg-white/90 shadow-xs">
              <div className="flex gap-4 items-center">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="pt-2">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-rose-50/50 rounded-2xl border border-rose-100 p-8 gap-3 max-w-xl mx-auto animate-in fade-in duration-500">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h3 className="text-xl font-bold text-slate-900">Đã xảy ra lỗi</h3>
          <p className="text-slate-600 font-semibold">Không thể tải danh sách giảng viên. Vui lòng tải lại trang hoặc thử lại sau.</p>
        </div>
      ) : instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 gap-4 animate-in fade-in duration-500">
          <Users className="w-16 h-16 text-indigo-300" />
          <h3 className="text-xl font-bold text-slate-900">Không tìm thấy giảng viên nào</h3>
          <p className="text-slate-500 font-semibold max-w-md">
            {submittedSearch.trim()
              ? `Không tìm thấy giảng viên nào khớp với từ khóa "${submittedSearch}". Thử tìm kiếm bằng tên hoặc chuyên môn khác.`
              : "Danh mục hiện đang trống hoặc chưa có giảng viên nào đăng ký."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {instructors.map((instructor) => (
              <InstructorCard key={instructor.publicId} instructor={instructor} />
            ))}
          </div>

          {/* Phân trang */}
          {totalElements > 0 && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <InstructorsPagination
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

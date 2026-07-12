"use client";

import * as React from "react";
import { BookOpen, Search, Filter, Plus, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CourseCard } from "./_components/course-card";
import { CourseFormDialog } from "./_components/course-form-dialog";
import { DataTablePagination } from "@/app/(admin)/admin/roles/_components/data-table-pagination";
import { useSearchCreatorCourses } from "@/hooks/use-search";
import { usePriceTiers } from "@/hooks/use-price-tier";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MyCoursesPage() {
  const [page, setPage] = React.useState(0);
  const [status, setStatus] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 400);
  const pageSize = 6; // Đặt kích thước trang là 6 để hiển thị lưới 3 cột đẹp mắt

  // Lấy danh sách khóa học của tôi thông qua search-service (100% Elasticsearch)
  const { data, isLoading, refetch, isFetching } = useSearchCreatorCourses(
    debouncedSearch,
    status === "ALL" ? undefined : status,
    page,
    pageSize,
    true
  );

  // Lấy các price tier để map hiển thị giá
  const { data: priceTiersData } = usePriceTiers(0, 100);
  const priceTiers = priceTiersData?.content || [];

  // Reset về trang 0 khi thay đổi tìm kiếm hoặc bộ lọc
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, status]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Khóa học của tôi
          </h1>
          <p className="text-slate-500 font-medium italic mt-1">
            Xây dựng nội dung, quản lý bài giảng và thiết lập mức giá cho khóa học của bạn.
          </p>
        </div>
        
        <CourseFormDialog onSuccess={refetch}>
          <Button className="h-11 px-6 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            TẠO KHÓA HỌC MỚI
          </Button>
        </CourseFormDialog>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm theo tiêu đề khóa học..." 
            className="border-slate-200 bg-white shadow-sm transition-all font-medium pl-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className={cn(
              "!h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0 outline-hidden !w-full md:w-[180px]"
            )}>
              <div className="flex items-center gap-2">
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="ALL" className="rounded-lg cursor-pointer py-2.5 px-3">Tất cả trạng thái</SelectItem>
              <SelectItem value="DRAFT" className="rounded-lg cursor-pointer py-2.5 px-3">Bản nháp</SelectItem>
              <SelectItem value="PUBLISHED" className="rounded-lg cursor-pointer py-2.5 px-3">Công khai</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-11 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-600 flex items-center gap-2 shrink-0 focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* 3. Main Content: Course Grid / Loading / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-slate-100 rounded-2xl p-5 space-y-4 bg-white/50">
              <Skeleton className="aspect-video w-full rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-md bg-slate-100" />
                <Skeleton className="h-4 w-5/6 rounded-md bg-slate-100" />
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between">
                <Skeleton className="h-4 w-1/4 rounded bg-slate-100" />
                <Skeleton className="h-4 w-1/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : !data || data.content?.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-16 flex flex-col justify-center items-center text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Chưa có khóa học nào</h3>
          <p className="text-slate-500 font-medium italic mt-2 max-w-sm">
            Bắt đầu chia sẻ kiến thức của bạn bằng cách kiến tạo khóa học đầu tiên trên UniWise.
          </p>
          <CourseFormDialog onSuccess={refetch}>
            <Button className="mt-8 h-11 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg active:scale-95 transition-all">
              Tạo khóa học ngay
            </Button>
          </CourseFormDialog>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                priceTiers={priceTiers}
                onRefresh={refetch} 
              />
            ))}
          </div>

          {/* 4. Pagination */}
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-8">
            <DataTablePagination 
              pageNumber={data.pageNumber}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

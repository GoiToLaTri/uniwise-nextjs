"use client";

import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InstructorsPaginationProps {
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function InstructorsPagination({
  pageNumber,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: InstructorsPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  
  const startOffset = totalElements === 0 ? 0 : pageNumber * pageSize + 1;
  const endOffset = Math.min((pageNumber + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 bg-white border border-slate-200 rounded-2xl shadow-xs animate-in fade-in duration-500">
      <div className="text-sm font-semibold text-slate-500">
        Hiển thị <span className="text-slate-950 font-bold">{startOffset}-{endOffset}</span> trong số{" "}
        <span className="text-indigo-600 font-black">{totalElements}</span> giảng viên
      </div>
      
      <div className="flex items-center gap-1.5">
        {/* Nút về trang đầu */}
        <Button
          variant="outline"
          size="icon"
          className="hidden h-9 w-9 sm:flex rounded-xl border-slate-200 text-slate-500 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
          onClick={() => onPageChange(0)}
          disabled={pageNumber === 0}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Nút trang trước */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Các số trang */}
        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <Button
              key={p}
              variant={pageNumber === p ? "default" : "ghost"}
              className={cn(
                "h-9 w-9 rounded-xl font-bold text-xs transition-all cursor-pointer",
                pageNumber === p 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
              onClick={() => onPageChange(p)}
            >
              {p + 1}
            </Button>
          ))}
        </div>

        {/* Nút trang sau */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Nút về trang cuối */}
        <Button
          variant="outline"
          size="icon"
          className="hidden h-9 w-9 sm:flex rounded-xl border-slate-200 text-slate-500 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={pageNumber === totalPages - 1}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

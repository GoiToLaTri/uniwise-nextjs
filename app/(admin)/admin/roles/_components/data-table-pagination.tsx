"use client";

import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  pageNumber,
  totalPages,
  totalElements,
  onPageChange,
}: DataTablePaginationProps) {
  // Tạo mảng các số trang để hiển thị
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
      <div className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
        Tổng số <span className="text-indigo-600">{totalElements}</span> bản ghi
      </div>
      
      <div className="flex items-center gap-2">
        {/* Nút về trang đầu */}
        <Button
          variant="outline"
          size="icon"
          className="hidden h-9 w-9 lg:flex rounded-xl border-slate-200"
          onClick={() => onPageChange(0)}
          disabled={pageNumber === 0}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Nút trang trước */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-slate-200"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Danh sách số trang */}
        <div className="flex items-center gap-1 mx-2">
          {pages.map((p) => (
            <Button
              key={p}
              variant={pageNumber === p ? "default" : "ghost"}
              className={cn(
                "h-9 w-9 rounded-xl font-black text-xs transition-all",
                pageNumber === p 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110" 
                  : "text-slate-500 hover:bg-slate-100"
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
          className="h-9 w-9 rounded-xl border-slate-200"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Nút về trang cuối */}
        <Button
          variant="outline"
          size="icon"
          className="hidden h-9 w-9 lg:flex rounded-xl border-slate-200"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={pageNumber === totalPages - 1}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
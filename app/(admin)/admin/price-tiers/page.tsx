"use client";

import * as React from "react";
import { Plus, Banknote, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PriceTierFormDialog } from "./_components/price-tier-form-dialog";
import { usePriceTiers } from "@/hooks/use-price-tier";
import { PriceTierTable } from "./_components/price-tier-table";
import { DataTablePagination } from "../roles/_components/data-table-pagination";

export default function PriceTiersPage() {
  // 1. State
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [currency, setCurrency] = React.useState("ALL");
  const pageSize = 10;

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Data Fetching
  const { data, isLoading, refetch } = usePriceTiers(
    page, 
    pageSize, 
    debouncedSearch, 
    currency
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Banknote className="w-8 h-8 text-indigo-600" />
            Quản lý mức giá
          </h1>
          <p className="text-slate-500 font-medium italic">
            Quản lý các cấp bậc giá cho khóa học và hệ thống
          </p>
        </div>

        <PriceTierFormDialog onSuccess={refetch}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-black h-11 rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all">
            <Plus className="w-4 h-4 mr-2" /> Tạo Mức Giá
          </Button>
        </PriceTierFormDialog>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm tên mức giá..." 
            className="pl-10 h-11 rounded-xl border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={currency} onValueChange={(v) => { setCurrency(v); setPage(0); }}>
            <SelectTrigger className="!h-11 w-full rounded-xl border-slate-200">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Loại tiền tệ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả tiền tệ</SelectItem>
              <SelectItem value="VND">VND (VN Đồng)</SelectItem>
              <SelectItem value="USD">USD (Đô la Mỹ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <PriceTierTable
          data={data} 
          isLoading={isLoading} 
          onRefresh={refetch} 
        />
        
        {!isLoading && data?.content && (
          <DataTablePagination
            pageNumber={data.pageNumber}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
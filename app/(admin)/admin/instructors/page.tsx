"use client";

import * as React from "react";
import { GraduationCap, Search, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { InstructorListTable } from "./_components/instructor-list-table";
import { DataTablePagination } from "../roles/_components/data-table-pagination";
import { useInstructorApplications } from "@/hooks/use-instructor";
import { cn } from "@/lib/utils";

export default function InstructorManagementPage() {
  const [page, setPage] = React.useState(0);
  const [status, setStatus] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const pageSize = 10;

  const { data, isLoading, refetch } = useInstructorApplications(page, pageSize, status === "ALL" ? undefined : status);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Quản lý giảng viên
          </h1>
          <p className="text-slate-500 font-medium italic">
            Phê duyệt và quản lý danh sách chuyên gia trên toàn hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="text-center border-r border-slate-100 pr-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tổng số</p>
              <p className="text-lg font-bold text-slate-900">{data?.totalElements || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Chờ duyệt</p>
              <p className="text-lg font-bold text-amber-600">{data?.content?.filter((instructor) => instructor.status === "PENDING").length || 0}</p> {/* Ví dụ số cứng */}
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Đã kích hoạt</p>
              <p className="text-lg font-bold text-emerald-600">{data?.content?.filter((instructor) => instructor.status === "APPROVED").length || 0}</p> {/* Ví dụ số cứng */}
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Đã từ chối</p>
              <p className="text-lg font-bold text-rose-600">{data?.content?.filter((instructor) => instructor.status === "REJECTED").length || 0}</p> {/* Ví dụ số cứng */}
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Đã tạm ngưng</p>
              <p className="text-lg font-bold text-violet-600">{data?.content?.filter((instructor) => instructor.status === "SUSPENDED").length || 0}</p> {/* Ví dụ số cứng */}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc tiêu đề chuyên môn..."
            className="border-slate-200 bg-white shadow-sm transition-all font-medium pl-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className={cn(
            "!h-11 rounded-xl border-slate-200 bg-white font-medium focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0 outline-hidden"
          )}>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <SelectValue placeholder="Trạng thái" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200">
            <SelectItem value="ALL" className="rounded-lg cursor-pointer py-2.5 px-3">Tất cả hồ sơ</SelectItem>
            <SelectItem value="PENDING" className="rounded-lg cursor-pointer py-2.5 px-3">Chờ phê duyệt</SelectItem>
            <SelectItem value="APPROVED" className="rounded-lg cursor-pointer py-2.5 px-3">Đã kích hoạt</SelectItem>
            <SelectItem value="REJECTED" className="rounded-lg cursor-pointer py-2.5 px-3">Đã từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => refetch()}
          className="h-11 px-6 rounded-xl border-slate-200 font-black uppercase tracking-widest text-[10px] bg-white hover:bg-slate-50 transition-all focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
        >
          Làm mới
        </Button>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <InstructorListTable
          data={data?.content}
          isLoading={isLoading}
          onRefresh={refetch}
        />

        {!isLoading && data && (
          <DataTablePagination
            pageNumber={data.pageNumber}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
}
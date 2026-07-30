"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { UserTable } from "./_components/user-table";
import { DataTablePagination } from "../roles/_components/data-table-pagination";
import { useProfiles } from "@/hooks/use-profile";

export default function UsersPage() {
  const [page, setPage] = React.useState(0);
  const pageSize = 10;

  const { data: usersData, isLoading } = useProfiles(page, pageSize);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-600" />
          Quản trị người dùng
        </h1>
        <p className="text-slate-500 font-medium italic">
          Theo dõi và quản lý quyền truy cập của các thành viên trong hệ thống Uniwise.
        </p>
      </div>

      {/* Filters */}
      {/* <UserFilters onSearch={setSearch} /> */}

      {/* Table Container */}
      <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <UserTable data={usersData} isLoading={isLoading} />
        
        {!isLoading && usersData && (
          <DataTablePagination 
            pageNumber={usersData.pageNumber}
            totalPages={usersData.totalPages}
            totalElements={usersData.totalElements}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
}

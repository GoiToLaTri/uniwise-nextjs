"use client";

import * as React from "react";
import { Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionTable } from "./_components/permission-table";
import { DataTablePagination } from "../roles/_components/data-table-pagination";
import { PermissionFormDialog } from "./_components/permission-form-dialog";
import { usePermissions } from "@/hooks/use-permission";

export default function PermissionsPage() {
  const [page, setPage] = React.useState(0);
  const pageSize = 10;

  const { data: permissionData, isLoading, refetch } = usePermissions(page, pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Key className="w-8 h-8 text-indigo-600" />
            Quản lý Quyền hạn
          </h1>
          <p className="text-slate-500 font-medium italic">
            Định nghĩa các quyền truy cập tài nguyên chi tiết trong hệ thống.
          </p>
        </div>
        
        <PermissionFormDialog onSuccess={refetch}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-black h-11 rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all">
            <Plus className="w-4 h-4 mr-2" /> Tạo quyền mới
          </Button>
        </PermissionFormDialog>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <PermissionTable 
          data={permissionData} 
          isLoading={isLoading} 
          onRefresh={refetch}
        />
        
        {!isLoading && permissionData?.content && (
          <DataTablePagination 
            pageNumber={permissionData.pageNumber}
            totalPages={permissionData.totalPages}
            totalElements={permissionData.totalElements}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
}
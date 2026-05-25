"use client";

import { MoreHorizontal, Edit3, Trash2, Key, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PermissionFormDialog } from "./permission-form-dialog";
import { PermissionResponse, useAllPermissions } from "@/hooks/use-permission";

export function PermissionTable({ data, isLoading, onRefresh }: { data?: { content: PermissionResponse[] } | null, isLoading: boolean, onRefresh: () => void }) {
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa quyền này? Hành động này có thể ảnh hưởng đến các vai trò đang được gán.")) {
      toast.success("Đã xóa quyền hạn thành công");
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl bg-slate-50" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-slate-100">
          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 w-[80px]">ID</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Tên quyền (Key)</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Mô tả chi tiết</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.content.map((item) => (
          <TableRow key={item.id} className="hover:bg-slate-50/30 border-slate-100 group transition-colors">
            <TableCell className="font-mono text-xs text-slate-400">#{item.id}</TableCell>
            <TableCell>
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 shadow-sm border border-indigo-100/50">
                <Key className="w-3.5 h-3.5" />
                </div>
                <code className="text-[13px] font-bold font-mono text-indigo-600 bg-indigo-50/30 px-2.5 py-1 rounded-lg border border-indigo-100/50 tracking-tight lowercase">
                {item.name}
                </code>
            </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                <Info className="w-3.5 h-3.5 text-slate-300" />
                {item.description}
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 border-slate-200 shadow-xl">
                  <PermissionFormDialog initialData={item} onSuccess={onRefresh}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                      <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa
                    </DropdownMenuItem>
                  </PermissionFormDialog>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh viễn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
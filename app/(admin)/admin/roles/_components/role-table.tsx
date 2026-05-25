"use client";

import { 
  MoreHorizontal, Edit3, Trash2, ShieldAlert, 
  Settings2, UserCircle2, CheckCircle2, MinusCircle
} from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionMatrix } from "./permission-matrix";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RoleListResponse } from "@/interfaces/response";
import { RoleFormDialog } from "./role-form-dialog";
import { useMemo } from "react";

interface RoleTableProps {
  data?: RoleListResponse | null;
  isLoading: boolean;
}

export function RoleTable({ data, isLoading }: RoleTableProps) {
  // 1. Trạng thái Loading: Render 5 dòng Skeleton
  if (isLoading) {
    return (
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-slate-100">
            {["Vai trò", "Mã", "Mô tả", "Trạng thái", "Học viên", ""].map((h) => (
              <TableHead key={h} className="text-[10px] font-black uppercase tracking-widest py-4 text-slate-400">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-slate-100">
              <TableCell><Skeleton className="h-5 w-32 bg-slate-100 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 bg-slate-100 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-5 w-48 bg-slate-100 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 bg-slate-100 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8 rounded-full mx-auto bg-slate-100" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8 rounded-xl ml-auto bg-slate-100" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // 2. Trạng thái không có dữ liệu
  if (!data || data.content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white">
        <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Không tìm thấy vai trò nào</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-slate-100">
          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-slate-500">Vai trò</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mã hệ thống</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mô tả chi tiết</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-center text-slate-500">Số học viên</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.content.map((role) => (
          <TableRow key={role.id} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  role.name === "ADMIN" ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">{role.displayName}</span>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200 uppercase">
                ROLE_{role.name}
              </code>
            </TableCell>
            <TableCell className="text-sm text-slate-500 font-medium max-w-[250px] truncate">
              {role.description}
            </TableCell>
            <TableCell>
              {role.isActive ? (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Hoạt động</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Vô hiệu</span>
                </div>
              )}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary" className="rounded-full font-black bg-white border border-slate-200 text-indigo-600 shadow-sm">
                <UserCircle2 className="w-3 h-3 mr-1" />
                {role.userCount}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Nút Cấp quyền */}
                <PermissionMatrix roleId={role.id}
                                  roleName={role.displayName}
                                  initialPermissionNames={role.permissions?.map(p => p.name) || []}>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </PermissionMatrix>

                {/* Dropdown hành động */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-2 border-slate-200 shadow-xl">
                    
                    {/* Bọc RoleFormDialog bên ngoài */}
                    <RoleFormDialog initialData={role}>
                      <DropdownMenuItem 
                        // QUAN TRỌNG: Ngăn Dropdown đóng lại ngay lập tức khi click
                        onSelect={(e) => e.preventDefault()} 
                        className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 mr-2" /> 
                        Chỉnh sửa
                      </DropdownMenuItem>
                    </RoleFormDialog>

                    <DropdownMenuItem className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4 mr-2" /> 
                      Xóa vai trò
                    </DropdownMenuItem>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
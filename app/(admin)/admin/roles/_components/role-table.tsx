"use client";

import { 
  MoreHorizontal, Edit3, Trash2, ShieldAlert, 
  Settings2, Fingerprint 
} from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PermissionMatrix } from "./permission-matrix";

const ROLES = [
  { id: "1", name: "Administrator", code: "ROLE_ADMIN", users: 3, description: "Toàn quyền hệ thống" },
  { id: "2", name: "Instructor", code: "ROLE_INSTRUCTOR", users: 12, description: "Quản lý khóa học và bài giảng" },
  { id: "3", name: "Student", code: "ROLE_USER", users: 1240, description: "Người dùng tham gia học tập" },
];

export function RoleTable() {
  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-slate-100">
          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Vai trò</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Mã định danh</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Mô tả</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Người dùng</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROLES.map((role) => (
          <TableRow key={role.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="font-bold text-slate-900">{role.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                {role.code}
              </code>
            </TableCell>
            <TableCell className="text-sm text-slate-500 font-medium max-w-[200px] truncate">
              {role.description}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary" className="rounded-full font-bold bg-slate-100 text-slate-600">
                {role.users}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                {/* Nút Cấp quyền (Matrix) */}
                <PermissionMatrix roleName={role.name}>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </PermissionMatrix>

                {/* Dropdown hành động */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-2 border-slate-200">
                    <DropdownMenuItem className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50">
                      <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                      <Trash2 className="w-4 h-4 mr-2" /> Xóa vai trò
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
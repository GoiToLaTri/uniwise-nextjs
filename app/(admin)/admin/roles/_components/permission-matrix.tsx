"use client";

import { 
  Sheet, SheetContent, SheetDescription, 
  SheetHeader, SheetTitle, SheetTrigger, SheetFooter 
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Lock, Save } from "lucide-react";

const PERMISSION_GROUPS = [
  {
    group: "Quản lý khóa học",
    permissions: [
      { id: "c_create", label: "Tạo khóa học mới" },
      { id: "c_edit", label: "Chỉnh sửa bài giảng" },
      { id: "c_delete", label: "Xóa khóa học" },
    ]
  },
  {
    group: "Quản lý người dùng",
    permissions: [
      { id: "u_view", label: "Xem danh sách" },
      { id: "u_edit", label: "Cập nhật thông tin" },
      { id: "u_ban", label: "Khóa tài khoản" },
    ]
  }
];

export function PermissionMatrix({ children, roleName }: { children: React.ReactNode, roleName: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md w-full bg-white border-l-slate-200 p-0 flex flex-col">
        <SheetHeader className="p-8 bg-slate-50 border-b border-slate-100 text-left">
          <SheetTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-indigo-600" />
            Cấp quyền: {roleName}
          </SheetTitle>
          <SheetDescription className="font-medium">
            Chọn các quyền hạn cụ thể dành cho vai trò này.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.group} className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {group.group}
              </h4>
              <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                {group.permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center justify-between">
                    <label htmlFor={perm.id} className="text-sm font-bold text-slate-700 cursor-pointer">
                      {perm.label}
                    </label>
                    <Checkbox id={perm.id} className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="p-8 border-t border-slate-100 bg-white">
          <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-100">
            <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
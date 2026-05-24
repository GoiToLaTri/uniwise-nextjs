import { ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleTable } from "./_components/role-table";
import { RoleFormDialog } from "./_components/role-form-dialog";

export default function RolesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Phân quyền hệ thống
          </h1>
          <p className="text-slate-500 font-medium italic">Quản lý vai trò và các quyền hạn truy cập tài nguyên.</p>
        </div>
        
        <RoleFormDialog>
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold h-11 rounded-xl shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4 mr-2" /> Tạo vai trò mới
          </Button>
        </RoleFormDialog>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden">
        <RoleTable />
      </div>
    </div>
  );
}
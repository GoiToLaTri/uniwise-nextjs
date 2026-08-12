"use client";

import * as React from "react";
import { 
  Sheet, SheetContent, SheetDescription, 
  SheetHeader, SheetTitle, SheetTrigger, SheetFooter 
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Lock, Save, Loader2, ShieldCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { PermissionResponse, useAllPermissions } from "@/hooks/use-permission";
import { useRolePermissions, useAssignPermissions } from "@/hooks/use-role";

export function PermissionMatrix({ 
  children, 
  roleId,
  roleName,
  initialPermissionNames = [] 
}: { 
  children: React.ReactNode, 
  roleId: number,
  roleName: string,
  initialPermissionNames?: string[]
}) {
  const { data: allPermissions, isLoading: isLoadingAllPermissions } = useAllPermissions();
  const { data: currentPermissions, isLoading: isLoadingCurrentPermissions } = useRolePermissions(roleId);
  const assignPermissions = useAssignPermissions();
  
  const [permissionSelection, setPermissionSelection] = React.useState<
    string[] | null
  >(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentPermissionNames =
    currentPermissions?.permissions?.map((permission) => permission.name) ??
    initialPermissionNames;
  const selectedPermissionNames =
    permissionSelection ?? currentPermissionNames;

  // Lọc và nhóm quyền theo Resource
  const groupedPermissions = React.useMemo(() => {
    if (!allPermissions || !Array.isArray(allPermissions)) return {};
    
    const filtered = allPermissions.filter(p => 
      p && p.name && (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );

    return filtered.reduce((acc: Record<string, PermissionResponse[]>, curr) => {
      if (!curr || !curr.name) return acc;
      const resource = curr.name.split(":")[0] || "Khác";
      if (!acc[resource]) acc[resource] = [];
      acc[resource].push(curr);
      return acc;
    }, {});
  }, [allPermissions, searchQuery]);

  const handleToggle = (permissionName: string) => {
    if (!permissionName) return;
    setPermissionSelection(
      selectedPermissionNames.includes(permissionName)
        ? selectedPermissionNames.filter((name) => name !== permissionName)
        : [...selectedPermissionNames, permissionName],
    );
  };

  const handleSave = async () => {
    if (!roleId) {
      toast.error("Không tìm thấy ID vai trò");
      return;
    }

    const currentNames = currentPermissionNames;
    const newNames = selectedPermissionNames;

    // So sánh để check có thay đổi không
    const hasChanges =
      newNames.length !== currentNames.length ||
      newNames.some(name => !currentNames.includes(name));

    if (!hasChanges) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }

    setIsSubmitting(true);

    try {
      // Gửi toàn bộ danh sách mới — backend sẽ replace
      await assignPermissions.mutateAsync({
        roleId,
        permissionNames: newNames,
      });
    } catch {
      // useAssignPermissions đã hiển thị lỗi chuẩn từ backend.
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingAllPermissions || isLoadingCurrentPermissions;
  const currentPermissionNameSet = new Set(currentPermissionNames);

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) setPermissionSelection(null);
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md w-full bg-white border-l-slate-200 p-0 flex flex-col outline-hidden">
        
        {/* Header Section */}
        <SheetHeader className="p-8 bg-slate-50 border-b border-slate-100 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-100">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <SheetTitle className="text-2xl font-black tracking-tight uppercase">
              Cấp quyền
            </SheetTitle>
          </div>
          <SheetDescription className="font-bold text-slate-500">
            Vai trò: <span className="text-indigo-600">{roleName || "Không xác định"}</span>
          </SheetDescription>

          {/* Search Bar trong Matrix */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm quyền..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-slate-200 text-xs font-bold pl-10 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:ring-offset-0"
            />
          </div>
        </SheetHeader>

        {/* Content Section: Nhóm các quyền */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang tải danh mục quyền...</p>
            </div>
          ) : Object.keys(groupedPermissions).length > 0 ? (
            Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource} className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {resource} Management
                  </h4>
                </div>
                
                <div className="grid gap-2">
                  {perms.map((perm) => {
                    if (!perm || !perm.name) return null;
                    
                    const isCurrentlyAssigned = currentPermissionNameSet.has(perm.name);
                    const isSelected = selectedPermissionNames.includes(perm.name);
                    
                    return (
                      <div 
                        key={perm.id || perm.name} 
                        onClick={() => handleToggle(perm.name)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                          isSelected 
                            ? "bg-indigo-50/50 border-indigo-200 shadow-sm" 
                            : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50"
                        )}
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {perm.name}
                            </code>
                            {isCurrentlyAssigned && isSelected && (
                              <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Giữ nguyên
                              </span>
                            )}
                            {!isCurrentlyAssigned && isSelected && (
                              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Sẽ cấp
                              </span>
                            )}
                            {isCurrentlyAssigned && !isSelected && (
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Sẽ thu hồi
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                            {perm.description || "Không có mô tả"}
                          </p>
                        </div>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(perm.name)}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 shadow-sm transition-transform group-active:scale-90"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                 {searchQuery ? "Không tìm thấy quyền nào phù hợp" : "Không có quyền nào trong hệ thống"}
               </p>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <SheetFooter className="p-8 border-t border-slate-100 bg-slate-50/50">
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Đã chọn</span>
                <span className="text-lg font-black text-indigo-600 leading-none">{selectedPermissionNames.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Đã cấp hiện tại</span>
                <span className="text-lg font-black text-green-600 leading-none">{currentPermissions?.permissions?.length || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Thay đổi</span>
                <span className="text-lg font-black text-amber-600 leading-none">
                  {(() => {
                    const currentNames = currentPermissionNames;
                    const added = selectedPermissionNames.filter(n => !currentNames.includes(n)).length;
                    const removed = currentNames.filter(n => !selectedPermissionNames.includes(n)).length;
                    return added + removed;
                  })()}
                </span>
              </div>
            </div>
            <Button 
              onClick={handleSave}
              disabled={isSubmitting || isLoading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ĐANG XỬ LÝ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> LƯU THAY ĐỔI
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

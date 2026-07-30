"use client";

import { ShieldCheck, User as UserIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import * as React from "react";
import { useAccount, useAccountRoles } from "@/hooks/use-account";
import { ProfileResponse } from "@/interfaces/response";
import { useRoles } from "@/hooks/use-role";

export function UserAccessDialog({ children, user }: { children: React.ReactNode, user: ProfileResponse }) {
    const { data: account } = useAccount(user.accountId);
    const { data: allRoles } = useRoles();
    const { assignRoles, revokeRoles, isAssigning, isRevoking } = useAccountRoles(user.accountId);
    const [open, setOpen] = React.useState(false);
    const [roleSelection, setRoleSelection] = React.useState<string[] | null>(null);
    const currentRoles = React.useMemo(
      () => account?.roles?.map((role) => role.name) ?? [],
      [account?.roles],
    );
    const selectedRoles = roleSelection ?? currentRoles;

    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen);
      setRoleSelection(null);
    };
  
    const handleRoleToggle = (roleName: string) => {
      setRoleSelection(
        selectedRoles.includes(roleName)
          ? selectedRoles.filter((name) => name !== roleName)
          : [...selectedRoles, roleName],
      );
    };
  
    const handleUpdateRoles = async () => {
      // Tìm roles cần thêm (có trong selected nhưng không có trong current)
      const rolesToAssign = selectedRoles.filter(role => !currentRoles.includes(role));
      
      // Tìm roles cần xóa (có trong current nhưng không có trong selected)
      const rolesToRevoke = currentRoles.filter(role => !selectedRoles.includes(role));
  
      try {
        // Thực hiện gán roles mới
        if (rolesToAssign.length > 0) {
          await assignRoles(rolesToAssign);
        }
        
        // Thực hiện thu hồi roles cũ
        if (rolesToRevoke.length > 0) {
          await revokeRoles(rolesToRevoke);
        }
        
        if (rolesToAssign.length === 0 && rolesToRevoke.length === 0) {
          toast.info("Không có thay đổi nào được thực hiện");
        }
        //  else {
        //   toast.success(`Đã cập nhật quyền hạn cho ${user.name}`);
        // }
        
        setOpen(false);
      } catch (error) {
        // Error đã được xử lý trong hook
        console.error("Failed to update roles:", error);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[450px] p-0 rounded-[1.25rem] border-none shadow-2xl overflow-hidden bg-white">
            <div className="h-2 bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500" />
          
          <DialogHeader className="px-8 pt-8">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              Quản lý quyền truy cập
            </DialogTitle>
            <DialogDescription className="font-medium">
              Thay đổi vai trò của <span className="text-slate-900 font-bold">{user.name}</span> trong hệ thống.
            </DialogDescription>
          </DialogHeader>
  
          <div className="px-8 py-6 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user.email}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Vai trò hiện tại: {account?.roles?.map(r => r.displayName).join(', ') || 'Chưa có vai trò'}
                </p>
              </div>
            </div>
  
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chọn vai trò</Label>
              <div className="grid grid-cols-1 gap-3">
                {allRoles?.content?.map((role) => (
                  <div 
                    key={role.id} 
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <Checkbox 
                      id={role.name} 
                      className="mt-1 rounded-md"
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                      disabled={isAssigning || isRevoking}
                    />
                    <div className="grid gap-1">
                      <label htmlFor={role.name} className={`text-sm font-bold text-slate-900 cursor-pointer ${(isAssigning || isRevoking) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {role.displayName}
                      </label>
                      <p className="text-xs text-slate-500">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  
          <DialogFooter className="px-8 pb-8">
            <Button 
              variant="ghost" 
              onClick={() => setOpen(false)} 
              className="rounded-xl font-bold"
              disabled={isAssigning || isRevoking}
            >
              Hủy bỏ
            </Button>
            <Button 
              onClick={handleUpdateRoles} 
              className="bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl px-8 shadow-lg shadow-indigo-100 transition-all active:scale-95"
              disabled={isAssigning || isRevoking}
            >
              {(isAssigning || isRevoking) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ĐANG XỬ LÝ...
                </>
              ) : (
                'LƯU THAY ĐỔI'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

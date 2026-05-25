"use client";

import { MoreHorizontal, ShieldCheck, Mail, Fingerprint, Ban, UserCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UserAccessDialog } from "./user-access-dialog";
import { ProfileResponse } from "@/interfaces/response";

export function UserTable({ data, isLoading }: { data?: { content: ProfileResponse[] } | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-slate-100">
          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Người dùng</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Email</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Public ID</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Trạng thái</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.content.map((user) => (
          <TableRow key={user.id} className="hover:bg-slate-50/30 border-slate-100 transition-colors group">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm rounded-xl">
                  <AvatarImage src={user.avatarUrl || ""} />
                  <AvatarFallback className="bg-indigo-600 text-white font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] font-medium text-slate-400">UID: {user.accountId.slice(0, 8)}...</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                <code className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {user.publicId}
                </code>
              </div>
            </TableCell>
            <TableCell className="text-center">
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Hoạt động
               </span>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border-slate-200">
                  <UserAccessDialog user={user}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                      <ShieldCheck className="w-4 h-4 mr-2" /> Quản lý quyền hạn
                    </DropdownMenuItem>
                  </UserAccessDialog>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
                    <Ban className="w-4 h-4 mr-2" /> Khóa tài khoản
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
"use client";

import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  GraduationCap, 
  Info, 
  Calendar,
  ShieldAlert,
  Star
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { InstructorProfile } from "@/interfaces/instructor.interface";

export function InstructorListTable({ data, isLoading, onRefresh }: { data?: InstructorProfile[], isLoading: boolean, onRefresh: () => void }) {
  


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
          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 w-[100px] pl-6 text-slate-500">ID</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thông tin Giảng viên</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kinh nghiệm</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6 text-slate-500">Ngày gửi đơn</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow key={item.id} className="hover:bg-slate-50/30 border-slate-100 group transition-colors">
            {/* 1. ID - Mono style */}
            <TableCell className="font-mono text-xs text-slate-400 pl-6">
              #{item.publicId.slice(0, 6)}
            </TableCell>

            {/* 2. Headline & Key - Indigo Box style */}
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 shadow-sm border border-indigo-100/50">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                    {/* <code className="text-[12px] font-bold font-mono text-indigo-600 bg-indigo-50/30 px-2 rounded-md border border-indigo-100/50 tracking-tighter w-fit leading-tight">
                        {item.headline.split(' ').slice(0, 3).join('-').toLowerCase()}...
                    </code> */}
                    <code className="text-[12px] font-bold font-mono text-indigo-600 bg-indigo-50/30 px-2 rounded-md border border-indigo-100/50 tracking-tighter w-fit leading-tight">
                        {item.name}
                    </code>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[13px]">
                        <Info className="w-3 h-3 text-slate-300" />
                        <span className="line-clamp-1 max-w-[200px]">{item.headline}</span>
                    </div>
                </div>
              </div>
            </TableCell>

            {/* 3. Experience */}
            <TableCell>
              <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {item.yearsOfExperience} Năm
              </div>
            </TableCell>

            {/* 4. Status Badge */}
            <TableCell>
              <Badge variant="outline" className={cn(
                "px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-none border",
                item.status === "PENDING" ? "text-amber-600 bg-amber-50/50 border-amber-100" :
                item.status === "APPROVED" ? "text-emerald-600 bg-emerald-50/50 border-emerald-100" :
                item.status === "REJECTED" ? "text-rose-600 bg-rose-50/50 border-rose-100" :
                "text-slate-400 bg-slate-50 border-slate-100"
              )}>
                {item.status}
              </Badge>
            </TableCell>

            {/* 5. Date - Right aligned mono */}
            <TableCell className="text-right pr-6 font-mono text-[11px] text-slate-400 font-bold italic">
               <div className="flex items-center justify-end gap-2">
                 <Calendar className="w-3 h-3" />
                 {format(new Date(item.appliedAt), "dd/MM/yyyy")}
               </div>
            </TableCell>

            {/* 6. Actions - Mirror PermissionTable */}
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 border-slate-200 shadow-xl animate-in zoom-in-95 duration-200">
                  <Link href={`/admin/instructors/${item.accountId}`}>
                    <DropdownMenuItem className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer py-2.5">
                      <Eye className="w-4 h-4 mr-2.5" /> Xem chi tiết
                    </DropdownMenuItem>
                  </Link>
                  
                  {item.status === "PENDING" && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-50" />
                      <DropdownMenuItem className="rounded-lg font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer py-2.5">
                        <CheckCircle2 className="w-4 h-4 mr-2.5" /> Phê duyệt đơn
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer py-2.5">
                        <XCircle className="w-4 h-4 mr-2.5" /> Từ chối hồ sơ
                      </DropdownMenuItem>
                    </>
                  )}

                  {item.status === "APPROVED" && (
                    <DropdownMenuItem className="rounded-lg font-bold text-slate-500 focus:bg-slate-100 focus:text-slate-900 cursor-pointer py-2.5">
                      <ShieldAlert className="w-4 h-4 mr-2.5" /> Tạm khóa
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
"use client";

import { 
  MoreHorizontal, Eye, CheckCircle2, XCircle, 
  GraduationCap, Info, Calendar, ShieldAlert, RefreshCcw,
  Loader2
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SuspensionDialog } from "./suspension-dialog";
import { InstructorProfile } from "@/interfaces/instructor.interface";
import { useApproveInstructorApplication, useRejectInstructorApplication, useSuspendInstructor, useReactivateInstructor } from "@/hooks/use-instructor";

export function InstructorListTable({ data, isLoading, onRefresh }: { data?: InstructorProfile[], isLoading: boolean, onRefresh: () => void }) {
  
  const approveMutation = useApproveInstructorApplication();
  const rejectMutation = useRejectInstructorApplication();
  const suspendMutation = useSuspendInstructor();
  const reactivateMutation = useReactivateInstructor();

  const handleAction = async (
    action: "APPROVED" | "REJECTED" | "SUSPENDED" | "REACTIVATED",
    item: InstructorProfile,
    reason?: string
  ) => {
    switch (action) {
      case "APPROVED":
        await approveMutation.mutateAsync(item.publicId);
        break;
      case "REJECTED":
        await rejectMutation.mutateAsync({ applicationId: item.publicId, reviewComment: reason ?? "" });
        break;
      case "SUSPENDED":
        await suspendMutation.mutateAsync({instructorId: item.publicId, reviewComment: reason ?? ""});
        break;
      case "REACTIVATED":
        await reactivateMutation.mutateAsync(item.publicId);
        break;
    }
    onRefresh();
  };

  const isActioning =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    suspendMutation.isPending ||
    reactivateMutation.isPending;

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
          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 w-[100px] pl-8 text-slate-500">ID</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thông tin Giảng viên</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kinh nghiệm</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-8 text-slate-500">Ngày gửi</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => {
          const isThisItemActioning =
            (approveMutation.isPending && approveMutation.variables === item.publicId) ||
            (rejectMutation.isPending && rejectMutation.variables?.applicationId === item.publicId) ||
            (suspendMutation.isPending && suspendMutation.variables?.instructorId === item.publicId) ||
            (reactivateMutation.isPending && reactivateMutation.variables === item.publicId);

          return (
            <TableRow key={item.id} className="hover:bg-slate-50/30 border-slate-100 group transition-colors">
              {/* 1. ID Mono */}
              <TableCell className="font-mono text-[11px] text-slate-400 pl-8 tracking-tighter">
                #{item.publicId.slice(0, 6)}
              </TableCell>

              {/* 2. Thông tin chính */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 shadow-sm border border-indigo-100/50">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <code className="text-[12px] font-bold font-mono text-indigo-600 bg-indigo-50/30 px-2.5 py-0.5 rounded-md border border-indigo-100/50 tracking-tighter w-fit leading-tight uppercase">
                      {item.name}
                    </code>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[12px]">
                      <Info className="w-3 h-3 text-slate-300" />
                      <span className="line-clamp-1 max-w-[220px]">{item.headline}</span>
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* 3. Experience */}
              <TableCell>
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <span>{item.yearsOfExperience}</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase">Năm</span>
                </div>
              </TableCell>

              {/* 4. Status Badge */}
              <TableCell>
                <Badge variant="outline" className={cn(
                  "px-2.5 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-none border",
                  item.status === "PENDING"   && "text-amber-600 bg-amber-50/50 border-amber-100",
                  item.status === "APPROVED"  && "text-emerald-600 bg-emerald-50/50 border-emerald-100",
                  item.status === "REJECTED"  && "text-rose-600 bg-rose-50/50 border-rose-100",
                  item.status === "SUSPENDED" && "text-violet-500 bg-violet-50/50 border-violet-200"
                )}>
                  {isThisItemActioning ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    item.status
                  )}
                </Badge>
              </TableCell>

              {/* 5. Date */}
              <TableCell className="text-right pr-8 font-mono text-[11px] text-slate-400 font-bold italic">
                <div className="flex items-center justify-end gap-2">
                  <Calendar className="w-3 h-3 text-slate-300" />
                  {format(new Date(item.appliedAt), "dd/MM/yyyy")}
                </div>
              </TableCell>

              {/* 6. Actions */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isActioning}
                      className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {isThisItemActioning
                        ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        : <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 border-slate-200 shadow-xl animate-in zoom-in-95 duration-200">
                    <Link href={`/admin/instructors/${item.accountId}`}>
                      <DropdownMenuItem className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer py-2.5">
                        <Eye className="w-4 h-4 mr-2.5 text-slate-400" /> Xem chi tiết
                      </DropdownMenuItem>
                    </Link>

                    {item.status === "PENDING" && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem
                          onClick={() => handleAction("APPROVED", item)}
                          disabled={isActioning}
                          className="rounded-lg font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer py-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2.5" /> Phê duyệt đơn
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("REJECTED", item)}
                          disabled={isActioning}
                          className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer py-2.5"
                        >
                          <XCircle className="w-4 h-4 mr-2.5" /> Từ chối hồ sơ
                        </DropdownMenuItem>
                      </>
                    )}

                    {item.status === "APPROVED" && (
                      <SuspensionDialog
                        instructorName={item.name}
                        onConfirm={(reason) => handleAction("SUSPENDED", item, reason)}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          disabled={isActioning}
                          className="rounded-lg font-bold text-slate-500 focus:bg-slate-100 focus:text-slate-900 cursor-pointer py-2.5"
                        >
                          <ShieldAlert className="w-4 h-4 mr-2.5" /> Tạm khóa hồ sơ
                        </DropdownMenuItem>
                      </SuspensionDialog>
                    )}

                    {item.status === "SUSPENDED" && (
                      <DropdownMenuItem
                        onClick={() => handleAction("REACTIVATED", item)}
                        disabled={isActioning}
                        className="rounded-lg font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer py-2.5"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2.5" /> Kích hoạt lại
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

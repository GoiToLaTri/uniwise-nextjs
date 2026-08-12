"use client";

import { MoreHorizontal, Edit3, Trash2, Banknote, Users } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PriceTierFormDialog } from "./price-tier-form-dialog";
import { PriceTierResponse, useDeletePriceTier } from "@/hooks/use-price-tier";

interface PriceTierTableProps {
  data?: { content: PriceTierResponse[] } | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PriceTierTable({ data, isLoading, onRefresh }: PriceTierTableProps) {
  const deleteMutation = useDeletePriceTier();

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa mức giá này? Hành động này không thể hoàn tác.")) {
      await deleteMutation.mutateAsync(id);
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
          <TableHead className="text-[10px] font-black uppercase py-4 w-[80px] text-slate-500 pl-6">ID</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-slate-500">Tên Mức Giá</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-slate-500 text-right">Đơn Giá</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-slate-500 text-center">Khóa Học Đang Dùng</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.content.map((item) => (
          <TableRow key={item.id} className="hover:bg-slate-50/30 border-slate-100 group transition-colors">
            <TableCell className="font-mono text-xs text-slate-400 pl-6">#{item.id.slice(0, 8)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100/50">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-slate-700">{item.tierName}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-black text-slate-900">
              <div className="flex items-center justify-end gap-1">
                {item.priceAmount.toLocaleString()}
                <Badge variant="outline" className="text-[10px] font-black bg-slate-50 ml-1">
                  {item.currency}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Badge className="bg-slate-100 text-slate-600 border-none rounded-lg font-bold">
                <Users className="w-3 h-3 mr-1" /> {item.courseCount}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-slate-100">
                  <PriceTierFormDialog initialData={item} onSuccess={onRefresh}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50">
                      <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa
                    </DropdownMenuItem>
                  </PriceTierFormDialog>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(item.id)} 
                    className="rounded-lg font-bold text-rose-600 focus:bg-rose-50"
                    disabled={item.courseCount > 0} // Không cho xóa nếu đang có khóa học dùng
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa mức giá
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

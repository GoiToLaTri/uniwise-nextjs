"use client";

import * as React from "react";
import { ShieldAlert, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SuspensionDialog({ 
  children, 
  instructorName, 
  onConfirm 
}: { 
  children: React.ReactNode, 
  instructorName: string, 
  onConfirm: (reason: string) => Promise<void> 
}) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setIsPending(true);
    try {
      await onConfirm(reason);
      setOpen(false);
      setReason("");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 rounded-[1.5rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className="h-2 bg-slate-900" />
        <DialogHeader className="px-8 pt-8 text-left">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-slate-900" />
            Tạm khóa hồ sơ
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500 italic leading-relaxed">
            Hành động này sẽ tạm ngừng quyền giảng dạy của chuyên gia <span className="text-slate-900 font-bold underline">{instructorName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 py-6 space-y-4">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Lý do đình chỉ (Bắt buộc)</Label>
            <Textarea 
              placeholder="Ví dụ: Vi phạm chính sách cộng đồng, chất lượng bài giảng không đạt..."
              className="min-h-[120px] rounded-xl border-slate-200 resize-none focus-visible:ring-indigo-500/20 transition-all"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-slate-50 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11" disabled={isPending}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isPending || !reason.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-11 px-6 shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "XÁC NHẬN KHÓA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
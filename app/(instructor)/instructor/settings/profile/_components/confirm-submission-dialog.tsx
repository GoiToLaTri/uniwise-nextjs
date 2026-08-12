"use client";

import * as React from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Send } from "lucide-react";

interface ConfirmSubmissionDialogProps {
  children: React.ReactNode;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function ConfirmSubmissionDialog({ children, onConfirm, isLoading }: ConfirmSubmissionDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        {/* Top Accent Bar */}
        <div className="h-2 bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500" />
        
        <DialogHeader className="px-10 pt-10 text-left">
          <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3 uppercase">
            <Send className="w-8 h-8 text-indigo-600" />
            Gửi xét duyệt lại
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-base leading-relaxed pt-2">
            Bạn đã hoàn thành việc cập nhật thông tin theo yêu cầu. Hồ sơ sẽ được chuyển đến Ban quản trị để phê duyệt lại.
          </DialogDescription>
        </DialogHeader>

        <div className="px-10 py-6">
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <p className="text-xs text-indigo-900 font-bold leading-relaxed">
                    Lưu ý: Quá trình xét duyệt có thể mất từ 2-3 ngày làm việc. Bạn sẽ nhận được thông báo qua Email khi có kết quả.
                </p>
            </div>
        </div>

        <DialogFooter className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)} 
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
            disabled={isLoading}
          >
            Xem lại
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "XÁC NHẬN GỬI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

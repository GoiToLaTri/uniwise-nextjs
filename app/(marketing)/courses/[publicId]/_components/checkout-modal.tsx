"use client";

import { Lock, Sparkles } from "lucide-react";

interface CheckoutModalProps {
  courseTitle: string;
  isPending: boolean;
  priceDisplay: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CheckoutModal({ courseTitle, isPending, priceDisplay, onClose, onConfirm }: CheckoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-linear-to-r from-blue-700 via-red-500 to-blue-700" />
        <div className="p-6 sm:p-7 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3"><Sparkles className="w-6 h-6" /></div>
            <h3 className="text-2xl font-black text-slate-900">Xác nhận thanh toán</h3>
            <p className="text-slate-500 text-sm font-semibold">Bạn đang đăng ký khóa học</p>
            <p className="font-bold text-slate-900 text-base line-clamp-2">{courseTitle}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">Giá khóa học</span>
              <span className="font-black text-lg text-slate-900">{priceDisplay}</span>
            </div>
            <div className="flex justify-between items-center gap-4 text-sm border-t border-slate-200 pt-4">
              <span className="text-slate-500 font-semibold">Hình thức thanh toán</span>
              <div className="shrink-0 flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
                <span className="font-black italic tracking-tight"><span className="text-blue-700">VN</span><span className="text-red-500">PAY</span></span>
                <span className="h-4 w-px bg-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sandbox</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p className="text-xs font-semibold leading-5 text-slate-600">Bạn sẽ được chuyển đến cổng VNPay Sandbox để hoàn tất thanh toán an toàn.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95 cursor-pointer text-sm">Hủy bỏ</button>
            <button onClick={onConfirm} disabled={isPending} className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2">
              {isPending ? "Đang chuyển hướng..." : "Thanh toán qua VNPay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

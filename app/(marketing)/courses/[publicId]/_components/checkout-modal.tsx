"use client";

import { CheckCircle2, Lock, Sparkles } from "lucide-react";

interface CheckoutModalProps {
  courseTitle: string;
  isFree: boolean;
  isPending: boolean;
  priceDisplay: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CheckoutModal({ courseTitle, isFree, isPending, priceDisplay, onClose, onConfirm }: CheckoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className={isFree ? "h-1.5 bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-500" : "h-1.5 bg-linear-to-r from-blue-700 via-red-500 to-blue-700"} />
        <div className="p-6 sm:p-7 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3"><Sparkles className="w-6 h-6" /></div>
            <h3 className="text-2xl font-black text-slate-900">
              {isFree ? "Xác nhận đăng ký" : "Xác nhận thanh toán"}
            </h3>
            <p className="text-slate-500 text-sm font-semibold">Bạn đang đăng ký khóa học</p>
            <p className="font-bold text-slate-900 text-base line-clamp-2">{courseTitle}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">Giá khóa học</span>
              <span className="font-black text-lg text-slate-900">{priceDisplay}</span>
            </div>
            {isFree ? (
              <div className="flex justify-between items-center gap-4 text-sm border-t border-slate-200 pt-4">
                <span className="text-slate-500 font-semibold">Hình thức đăng ký</span>
                <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                  Ghi danh miễn phí
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-4 text-sm border-t border-slate-200 pt-4">
                <span className="text-slate-500 font-semibold">Hình thức thanh toán</span>
                <div className="shrink-0 flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
                  <span className="font-black italic tracking-tight"><span className="text-blue-700">VN</span><span className="text-red-500">PAY</span></span>
                  <span className="h-4 w-px bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sandbox</span>
                </div>
              </div>
            )}
          </div>

          <div className={isFree ? "flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4" : "flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"}>
            {isFree ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            )}
            <p className="text-xs font-semibold leading-5 text-slate-600">
              {isFree
                ? "Không phát sinh thanh toán. Sau khi xác nhận, khóa học sẽ được thêm vào Góc học tập của bạn."
                : "Bạn sẽ được chuyển đến cổng VNPay Sandbox để hoàn tất thanh toán an toàn."}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} disabled={isPending} className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95 cursor-pointer text-sm disabled:cursor-not-allowed disabled:opacity-50">Hủy bỏ</button>
            <button onClick={onConfirm} disabled={isPending} className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm flex items-center justify-center gap-2">
              {isPending
                ? isFree
                  ? "Đang ghi danh..."
                  : "Đang chuyển hướng..."
                : isFree
                  ? "Xác nhận đăng ký"
                  : "Thanh toán qua VNPay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

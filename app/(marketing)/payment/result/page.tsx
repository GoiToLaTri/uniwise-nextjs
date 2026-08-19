"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePaymentDetail } from "@/hooks/use-payment";
import { useCourse } from "@/hooks/use-course";
import apiClient from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrencyAmount } from "@/lib/currency";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw, 
  Home, 
  BookOpen
} from "lucide-react";
import { Suspense } from "react";

const emptySubscribe = () => () => undefined;

function useHasHydrated() {
  return React.useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const hasHydrated = useHasHydrated();
  
  // Các query parameter trả về từ VNPay
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpAmount = searchParams.get("vnp_Amount");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  
  const [paymentId] = React.useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : localStorage.getItem("uniwise_last_payment_id"),
  );
  const [coursePublicId] = React.useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : localStorage.getItem("uniwise_last_course_public_id"),
  );
  const [isRelayingIPN, setIsRelayingIPN] = React.useState(false);

  // Đọc thông tin từ localStorage khi client mount & Relay IPN parameters về local backend
  React.useEffect(() => {
    const relayIPN = async () => {
      if (searchParams.has("vnp_SecureHash") && searchParams.has("vnp_TxnRef")) {
        setIsRelayingIPN(true);
        try {
          const queryString = searchParams.toString();
          await apiClient.get(`/payment-service/api/v1/payments/vnpay-ipn?${queryString}`);
          console.log("IPN relay completed successfully");
        } catch (err) {
          console.error("Failed to relay IPN callback to backend:", err);
        } finally {
          setIsRelayingIPN(false);
        }
      }
    };

    relayIPN();
  }, [searchParams]);

  // Gọi query để lấy thông tin chi tiết giao dịch từ DB
  const { data: payment, isLoading } = usePaymentDetail(paymentId || "");

  // Gọi thêm dữ liệu khóa học để hiển thị tên khóa học (nếu có coursePublicId)
  const { data: course, refetch: refetchCourse } = useCourse(coursePublicId || "");

  // Dọn dẹp localStorage khi giao dịch kết thúc trạng thái PENDING
  React.useEffect(() => {
    if (payment && payment.status !== "PENDING") {
      localStorage.removeItem("uniwise_last_payment_id");
    }
  }, [payment]);

  // Xác định trạng thái giao dịch
  // 1. Nếu có kết nối DB: Ưu tiên trạng thái trong database
  // 2. Nếu không có UUID trong localStorage (ví dụ chuyển hướng mất state): Fallback theo ResponseCode từ VNPay
  const isSuccess = payment 
    ? payment.status === "SUCCESS"
    : vnpResponseCode === "00";

  const isFailed = payment 
    ? payment.status === "FAILED"
    : vnpResponseCode !== null && vnpResponseCode !== "00";

  const isPending = !hasHydrated || isRelayingIPN || (payment
    ? payment.status === "PENDING"
    : paymentId !== null && isLoading);

  React.useEffect(() => {
    if (!isSuccess || !coursePublicId || course?.isEnrolled) return;

    let attempts = 0;
    const refreshEnrollment = async () => {
      attempts += 1;
      await queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      await refetchCourse();
    };

    void refreshEnrollment();
    const intervalId = window.setInterval(() => {
      if (attempts >= 10) {
        window.clearInterval(intervalId);
        return;
      }
      void refreshEnrollment();
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [course?.isEnrolled, coursePublicId, isSuccess, queryClient, refetchCourse]);

  // Format số tiền hiển thị
  const amountDisplay = React.useMemo(() => {
    if (payment) {
      return formatCurrencyAmount(payment.amount, payment.currency);
    }
    if (vnpAmount) {
      const parsedAmount = parseInt(vnpAmount) / 100;
      return formatCurrencyAmount(parsedAmount, "VND");
    }
    return "N/A";
  }, [payment, vnpAmount]);

  // CTA Link cho khóa học
  const courseLink = coursePublicId ? `/courses/${coursePublicId}` : "/courses";
  const learningLink = coursePublicId && course?.isEnrolled
    ? `/course/${coursePublicId}/learn`
    : courseLink;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-purple-50/30 px-4 py-16">
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200/80 shadow-2xl p-8 max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
        
        {/* ─── TRẠNG THÁI LOADING ────────────────────────────────────────────── */}
        {isPending && (
          <div className="space-y-6 py-4">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto shadow-lg shadow-indigo-100/50">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Đang xác thực giao dịch</h3>
              <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                Hệ thống đang kiểm tra trạng thái thanh toán từ VNPay.<br />Vui lòng không đóng trình duyệt hoặc quay lại.
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-pulse rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
        )}

        {/* ─── TRẠNG THÁI THÀNH CÔNG ─────────────────────────────────────────── */}
        {!isPending && isSuccess && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Thanh toán thành công!</h3>
              <p className="text-slate-500 text-sm font-medium">
                Cảm ơn bạn đã lựa chọn khóa học của UniWise. Giao dịch đăng ký đã hoàn tất và tài liệu học đã sẵn sàng.
              </p>
            </div>
          </div>
        )}

        {/* ─── TRẠNG THÁI THẤT BẠI ───────────────────────────────────────────── */}
        {!isPending && isFailed && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-100/50">
              <XCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Thanh toán thất bại</h3>
              <p className="text-slate-500 text-sm font-medium">
                Giao dịch của bạn không thể hoàn tất hoặc đã bị hủy. Vui lòng kiểm tra số dư thẻ hoặc thử lại phương thức khác.
              </p>
            </div>
          </div>
        )}

        {/* ─── BẢNG CHI TIẾT GIAO DỊCH ───────────────────────────────────────── */}
        {!isPending && (isSuccess || isFailed) && (
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 text-left space-y-3.5">
            <div className="text-center border-b border-slate-200/60 pb-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Chi tiết giao dịch</span>
            </div>
            
            {course && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Khóa học</span>
                <span className="text-sm font-bold text-slate-800 line-clamp-2">{course.title}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Số tiền</span>
                <span className="text-sm font-bold text-slate-800">{amountDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Mã giao dịch</span>
                <span className="text-sm font-mono text-slate-700 font-bold">
                  {payment?.txnRef || vnpTxnRef || "N/A"}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/40">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Hình thức</span>
                <span className="text-xs font-bold text-slate-600">VNPay Gateway</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Trạng thái</span>
                <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isSuccess ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {isSuccess ? "ĐÃ THANH TOÁN" : "THẤT BẠI"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── KHU VỰC ĐIỀU HƯỚNG CTA ────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pt-4">
          {!isPending && isSuccess && (
            <>
              <Link 
                href={learningLink}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-100"
              >
                <BookOpen className="w-4 h-4" />
                {course?.isEnrolled ? "Vào học ngay" : "Xem khóa học"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/"
                className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Trang chủ
              </Link>
            </>
          )}

          {!isPending && isFailed && (
            <>
              <Link 
                href={courseLink}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-100"
              >
                <RefreshCw className="w-4 h-4" />
                Quay lại thanh toán lại
              </Link>
              <Link 
                href="/"
                className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Quay về trang chủ
              </Link>
            </>
          )}

          {isPending && (
            <button 
              disabled
              className="w-full h-12 rounded-xl bg-indigo-50 text-indigo-400 font-bold text-sm flex items-center justify-center gap-2"
            >
              Đang xác thực thông tin...
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function PaymentResultLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-purple-50/30 px-4 py-16">
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200/80 shadow-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Đang tải thông tin...</h3>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultLoading />}>
      <PaymentResultContent />
    </Suspense>
  );
}

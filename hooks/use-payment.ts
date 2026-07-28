import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { getTokenResponse } from "@/stores/token-store";
import { ApiResponse } from "@/interfaces/response";
import { PaymentCreateRequest, PaymentResponse } from "@/interfaces/payment.interface";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/auth-error";

export const PAYMENT_DETAIL_QUERY_KEY = (id: string) => ["payment", id];

// Hook tạo mới một giao dịch thanh toán qua VNPay
export function useCreatePayment() {
  return useMutation({
    mutationFn: async (data: PaymentCreateRequest): Promise<PaymentResponse | null> => {
      try {
        // Kiểm tra token để đảm bảo người dùng đã đăng nhập
        const tokenResponse = await getTokenResponse();
        if (!tokenResponse) {
          toast.error("Vui lòng đăng nhập để thanh toán.");
          return null;
        }

        const response = await apiClient.post<never, ApiResponse<PaymentResponse>>(
          "/payment-service/api/v1/payments",
          data
        );
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể khởi tạo thanh toán."));
        throw error;
      }
    },
  });
}

// Hook tra cứu trạng thái một giao dịch thanh toán bằng UUID từ DB
export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: PAYMENT_DETAIL_QUERY_KEY(id),
    queryFn: async (): Promise<PaymentResponse | null> => {
      if (!id) return null;

      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<never, ApiResponse<PaymentResponse>>(
        `/payment-service/api/v1/payments/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    // Kiểm tra định kỳ mỗi 2 giây nếu trạng thái là PENDING để cập nhật tự động (polling)
    refetchInterval: (query) => {
      const data = query.state.data as PaymentResponse | null;
      if (data && data.status === "PENDING") {
        return 2000;
      }
      return false;
    },
  });
}

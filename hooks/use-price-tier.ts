// use-price-tier.ts
import { ApiResponse, ListResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/auth-error";

// Types
export interface CreatePriceTierRequest {
  tierName: string;
  priceAmount: number;
  currency: string;
}

export interface UpdatePriceTierRequest {
  tierName: string;
  priceAmount: number;
  currency: string;
}

export interface PriceTierResponse {
  id: string;
  tierName: string;
  priceAmount: number;
  currency: string;
  courseCount: number;
}

export interface PriceTierListResponse extends ListResponse {
  content: PriceTierResponse[];
}

// Query keys
export const PRICE_TIERS_QUERY_KEY = ["price-tiers"];
const PRICE_TIER_DETAIL_QUERY_KEY = (id: string) => ["price-tier", id];

// Hook lấy danh sách price tiers (có phân trang)
export function usePriceTiers(
  pageNumber = 0, 
  pageSize = 10, 
  search?: string, 
  currency?: string // Bổ sung tham số lọc
) {
  return useQuery({
    queryKey: [...PRICE_TIERS_QUERY_KEY, pageNumber, pageSize, search, currency],
    queryFn: async function() {
      const response = await apiClient.get<never, ApiResponse<PriceTierListResponse>>(
        "/course-service/api/v1/price-tiers",
        {
          params: { 
            page: pageNumber, 
            size: pageSize, 
            search: search || undefined, 
            currency: currency === "ALL" ? undefined : currency 
          },
        }
      );
      return response.data;
    },
  });
}

// Hook lấy chi tiết một price tier
export function usePriceTier(id: string) {
  return useQuery({
    queryKey: PRICE_TIER_DETAIL_QUERY_KEY(id),
    queryFn: async (): Promise<PriceTierResponse | null> => {
      if (!id) return null;

      const response = await apiClient.get<never, ApiResponse<PriceTierResponse>>(
        `/course-service/api/v1/price-tiers/${id}`
      );

      return response.data;
    },
    enabled: !!id,
  });
}

// Hook tạo mới price tier
export function useCreatePriceTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePriceTierRequest): Promise<PriceTierResponse | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<PriceTierResponse>>(
          "/course-service/api/v1/price-tiers",
          data
        );
        toast.success("Tạo price tier thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể tạo price tier mới."));
        throw error;
      }
    },
    onSuccess: (newPriceTier) => {
      if (newPriceTier) {
        // Invalidate và refetch danh sách price tiers
        queryClient.invalidateQueries({ queryKey: PRICE_TIERS_QUERY_KEY });
        
        // Set cache chi tiết
        queryClient.setQueryData(PRICE_TIER_DETAIL_QUERY_KEY(newPriceTier.id), newPriceTier);
      }
    },
  });
}

// Hook cập nhật price tier
export function useUpdatePriceTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePriceTierRequest;
    }): Promise<PriceTierResponse | null> => {
      try {
        const response = await apiClient.put<never, ApiResponse<PriceTierResponse>>(
          `/course-service/api/v1/price-tiers/${id}`,
          data
        );
        toast.success("Cập nhật price tier thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể cập nhật price tier."));
        throw error;
      }
    },
    onSuccess: (updatedPriceTier, { id }) => {
      if (updatedPriceTier) {
        // Update cache chi tiết
        queryClient.setQueryData(PRICE_TIER_DETAIL_QUERY_KEY(id), updatedPriceTier);
        
        // Invalidate danh sách price tiers
        queryClient.invalidateQueries({ queryKey: PRICE_TIERS_QUERY_KEY });
      }
    },
  });
}

// Hook xóa price tier
export function useDeletePriceTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/course-service/api/v1/price-tiers/${id}`);
        toast.success("Xóa price tier thành công!");
        return true;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể xóa price tier."));
        throw error;
      }
    },
    onSuccess: (_, id) => {
      // Xóa khỏi cache chi tiết
      queryClient.removeQueries({ queryKey: PRICE_TIER_DETAIL_QUERY_KEY(id) });
      
      // Invalidate danh sách price tiers
      queryClient.invalidateQueries({ queryKey: PRICE_TIERS_QUERY_KEY });
    },
  });
}

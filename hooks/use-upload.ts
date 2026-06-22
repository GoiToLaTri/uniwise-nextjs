import { ApiResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UploadResponse {
  url: string;
  fileName: string;
}

// Hook upload thumbnail lên media-service
export function useUploadThumbnail() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse | null> => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await apiClient.post<any, ApiResponse<UploadResponse>>(
          "/media-service/api/v1/uploads/thumbnail",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } catch (error: any) {
        const message = error?.response?.data?.message || "Lỗi khi tải ảnh lên.";
        toast.error(message);
        throw error;
      }
    },
  });
}

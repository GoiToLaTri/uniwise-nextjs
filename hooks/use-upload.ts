import { ApiResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUploadErrorMessage } from "@/lib/upload-error";

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
        const response = await apiClient.post<
          never,
          ApiResponse<UploadResponse>,
          FormData
        >(
          "/media-service/api/v1/uploads/thumbnail",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } catch (error: unknown) {
        toast.error(getUploadErrorMessage(error, "Lỗi khi tải ảnh lên."));
        throw error;
      }
    },
  });
}

import axios, { CancelTokenSource } from "axios";
import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

export interface UploadItem {
  lessonId: string;
  lessonTitle: string;
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "failed" | "canceled";
  cancelTokenSource?: CancelTokenSource;
  error?: string;
}

interface UploadStore {
  uploads: Record<string, UploadItem>;
  startUpload: (
    lessonId: string,
    lessonTitle: string,
    file: File,
    onUploadSuccess: () => void
  ) => Promise<void>;
  cancelUpload: (lessonId: string) => void;
  removeUpload: (lessonId: string) => void;
  isUploadingAny: () => boolean;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: {},

  startUpload: async (lessonId, lessonTitle, file, onUploadSuccess) => {
    const cancelTokenSource = axios.CancelToken.source();

    // Khởi tạo trạng thái tải lên
    set((state) => ({
      uploads: {
        ...state.uploads,
        [lessonId]: {
          lessonId,
          lessonTitle,
          fileName: file.name,
          progress: 0,
          status: "uploading",
          cancelTokenSource,
        },
      },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", lessonId);

      await apiClient.post(
        "/media-service/api/v1/uploads/video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          cancelToken: cancelTokenSource.token,
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;

            set((state) => ({
              uploads: {
                ...state.uploads,
                [lessonId]: {
                  ...state.uploads[lessonId],
                  progress,
                },
              },
            }));
          },
        }
      );

      // Cập nhật trạng thái thành công
      set((state) => ({
        uploads: {
          ...state.uploads,
          [lessonId]: {
            ...state.uploads[lessonId],
            status: "completed",
            progress: 100,
          },
        },
      }));

      toast.success(`Tải lên video cho bài học "${lessonTitle}" hoàn tất!`);
      onUploadSuccess();
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        // Tải lên bị hủy
        set((state) => ({
          uploads: {
            ...state.uploads,
            [lessonId]: {
              ...state.uploads[lessonId],
              status: "canceled",
            },
          },
        }));
        toast.warning(`Đã hủy tải lên video cho bài học "${lessonTitle}".`);
      } else {
        const err = error as { response?: { data?: { message?: string } } };
        const message = err.response?.data?.message || "Lỗi kết nối tải lên video.";
        set((state) => ({
          uploads: {
            ...state.uploads,
            [lessonId]: {
              ...state.uploads[lessonId],
              status: "failed",
              error: message,
            },
          },
        }));
        toast.error(`Tải lên video thất bại cho "${lessonTitle}": ${message}`);
      }
    }
  },

  cancelUpload: (lessonId) => {
    const uploadItem = get().uploads[lessonId];
    if (uploadItem && uploadItem.status === "uploading" && uploadItem.cancelTokenSource) {
      uploadItem.cancelTokenSource.cancel("User cancelled upload");
    }
  },

  removeUpload: (lessonId) => {
    set((state) => {
      const newUploads = { ...state.uploads };
      delete newUploads[lessonId];
      return { uploads: newUploads };
    });
  },

  isUploadingAny: () => {
    return Object.values(get().uploads).some((item) => item.status === "uploading");
  },
}));

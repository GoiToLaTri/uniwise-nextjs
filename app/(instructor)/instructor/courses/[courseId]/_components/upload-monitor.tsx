"use client";

import { AlertTriangle, CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type UploadItem } from "@/stores/upload-store";

interface UploadMonitorProps {
  uploads: Record<string, UploadItem>;
  isUploadingAny: boolean;
  onCancel: (lessonId: string) => void;
  onRemove: (lessonId: string) => void;
}

const statusColors: Record<UploadItem["status"], string> = {
  uploading: "bg-indigo-600",
  completed: "bg-emerald-500",
  failed: "bg-rose-500",
  canceled: "bg-slate-400",
};

export function UploadMonitor({ uploads, isUploadingAny, onCancel, onRemove }: UploadMonitorProps) {
  const uploadItems = Object.values(uploads);

  if (uploadItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className={cn("w-4 h-4 text-indigo-600", isUploadingAny && "animate-spin")} />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Tiến trình tải lên video</span>
        </div>
        <Badge variant="outline" className="px-1.5 py-0 rounded bg-indigo-50 text-indigo-600 font-bold text-[9px]">
          {uploadItems.filter((item) => item.status === "uploading").length} Đang tải
        </Badge>
      </div>

      <div className="p-4 space-y-3.5 max-h-[300px] overflow-y-auto">
        {uploadItems.map((item) => {
          const isUploading = item.status === "uploading";

          return (
            <div key={item.lessonId} className="space-y-2 p-3 rounded-xl border border-slate-100 bg-slate-50/30">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-700 line-clamp-1">{item.lessonTitle}</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[240px]">{item.fileName}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isUploading ? (
                    <>
                      <span className="text-[10px] font-black text-indigo-600">{item.progress}%</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const shouldCancel = window.confirm(`Bạn có chắc chắn muốn dừng tải lên video cho bài học "${item.lessonTitle}"?`);
                          if (shouldCancel) onCancel(item.lessonId);
                        }}
                        className="h-6 w-6 rounded-md hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {item.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {item.status === "failed" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                      {item.status === "canceled" && <XCircle className="w-4 h-4 text-slate-400" />}
                      <Button variant="ghost" size="icon" onClick={() => onRemove(item.lessonId)} className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-300", statusColors[item.status])} style={{ width: `${item.progress}%` }} />
                </div>
                {item.error && <p className="text-[9px] font-bold text-rose-500 line-clamp-1 mt-1">Lỗi: {item.error}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

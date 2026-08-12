"use client";

import * as React from "react";
import { AlertCircle, Link as LinkIcon, Paperclip, Video } from "lucide-react";
import { type UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VIDEO_FILE_ACCEPT } from "@/lib/upload-validation";
import { cn } from "@/lib/utils";

type UploadMode = "file" | "url";

interface LessonContentFieldProps {
  contentError?: string;
  contentRegistration: UseFormRegisterReturn<"contentReference">;
  initialContentReference?: string;
  isPending: boolean;
  lessonType: string;
  selectedFile: File | null;
  uploadMode: UploadMode;
  videoFileInputId: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadModeChange: (mode: UploadMode) => void;
}

export function LessonContentField({
  contentError,
  contentRegistration,
  initialContentReference,
  isPending,
  lessonType,
  selectedFile,
  uploadMode,
  videoFileInputId,
  onFileChange,
  onUploadModeChange,
}: LessonContentFieldProps) {
  if (lessonType !== "VIDEO") {
    return (
      <div className="space-y-1">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung tham chiếu (URL / Reference)</Label>
        <Input
          {...contentRegistration}
          placeholder={lessonType === "QUIZ" ? "Nhập ID câu hỏi trắc nghiệm..." : "VD: https://docs.google.com/document/..."}
          className={cn("h-11 rounded-xl border-slate-200", contentError && "border-rose-500 focus-visible:ring-rose-500/10")}
          disabled={isPending}
        />
        {contentError && (
          <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {contentError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phương thức đăng video</Label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onUploadModeChange("file")} className={cn("text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider transition-all flex items-center gap-1", uploadMode === "file" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-transparent text-slate-400 hover:text-slate-600")}>
            <Paperclip className="w-3 h-3" /> Từ thiết bị
          </button>
          <button type="button" onClick={() => onUploadModeChange("url")} className={cn("text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider transition-all flex items-center gap-1", uploadMode === "url" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-transparent text-slate-400 hover:text-slate-600")}>
            <LinkIcon className="w-3 h-3" /> Link liên kết
          </button>
        </div>
      </div>

      {uploadMode === "file" ? (
        <div className="space-y-2">
          <div onClick={() => document.getElementById(videoFileInputId)?.click()} className={cn("border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-400 transition-all cursor-pointer", selectedFile && "border-emerald-300 bg-emerald-50/10")}>
            <input id={videoFileInputId} type="file" accept={VIDEO_FILE_ACCEPT} className="hidden" onChange={onFileChange} disabled={isPending} />
            {selectedFile ? (
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-2"><Video className="w-6 h-6" /></div>
                <p className="text-xs font-bold text-slate-700 max-w-[280px] truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-xs mb-2"><Video className="w-6 h-6" /></div>
                <p className="text-xs font-bold text-slate-600">Chọn video từ thiết bị của bạn</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Chỉ hỗ trợ MP4 (Tối đa 200 MB)</p>
              </div>
            )}
          </div>
          {initialContentReference && !selectedFile && (
            <p className="text-[10px] text-slate-400 font-medium italic text-right">* Đã có sẵn tệp: {initialContentReference.substring(initialContentReference.lastIndexOf("/") + 1)}</p>
          )}
        </div>
      ) : (
        <Input {...contentRegistration} placeholder="VD: https://youtube.com/embed/... hoặc URL video" className="h-11 rounded-xl border-slate-200" disabled={isPending} />
      )}
    </div>
  );
}

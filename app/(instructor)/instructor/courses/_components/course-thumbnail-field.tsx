"use client";

import * as React from "react";
import { AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { type UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RemoteImage } from "@/components/shared/remote-image";
import { THUMBNAIL_FILE_ACCEPT } from "@/lib/upload-validation";
import { cn } from "@/lib/utils";

interface CourseThumbnailFieldProps {
  errorMessage?: string;
  fileInputId: string;
  isPending: boolean;
  isUploading: boolean;
  registration: UseFormRegisterReturn<"thumbnailUrl">;
  thumbnailUrl?: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CourseThumbnailField({
  errorMessage,
  fileInputId,
  isPending,
  isUploading,
  registration,
  thumbnailUrl,
  onFileUpload,
}: CourseThumbnailFieldProps) {
  const [showUrlInput, setShowUrlInput] = React.useState(false);

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ảnh bìa khóa học</Label>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-400 transition-all flex flex-col items-center justify-center aspect-video cursor-pointer",
          errorMessage && "border-rose-300 bg-rose-50/20",
          isUploading && "pointer-events-none",
        )}
        onClick={() => document.getElementById(fileInputId)?.click()}
      >
        <input id={fileInputId} type="file" accept={THUMBNAIL_FILE_ACCEPT} className="hidden" onChange={onFileUpload} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-slate-600">Đang tải ảnh lên...</p>
          </div>
        ) : thumbnailUrl ? (
          <>
            <RemoteImage src={thumbnailUrl} alt="Course Thumbnail" fill sizes="600px" className="object-cover" />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs font-bold">Thay đổi ảnh bìa</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center p-6">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 mb-3 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-700">Tải ảnh bìa lên</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Định dạng JPG, JPEG, PNG, WEBP (Tối đa 10 MB)</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => setShowUrlInput((isVisible) => !isVisible)} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-wider bg-transparent border-none cursor-pointer focus:outline-hidden">
          {showUrlInput ? "Ẩn nhập URL" : "Hoặc sử dụng đường dẫn ảnh (URL)"}
        </button>
      </div>
      {showUrlInput && (
        <div className="space-y-1 mt-2 animate-in slide-in-from-top-2 duration-300">
          <Input {...registration} placeholder="https://images.unsplash.com/... hoặc link ảnh" className={cn("h-11 rounded-xl border-slate-200 text-xs", errorMessage && "border-rose-500")} disabled={isPending} />
        </div>
      )}
      {errorMessage && (
        <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errorMessage}</p>
      )}
    </div>
  );
}

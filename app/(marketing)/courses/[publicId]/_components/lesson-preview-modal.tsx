"use client";

import { FileText, PlayCircle } from "lucide-react";
import { VideoPlayer } from "@/components/shared/video-player";

export interface PreviewLesson {
  title: string;
  type: string;
  url: string;
}

interface LessonPreviewModalProps {
  isEnrolled: boolean;
  lesson: PreviewLesson;
  onCheckout: () => void;
  onClose: () => void;
}

export function LessonPreviewModal({ isEnrolled, lesson, onCheckout, onClose }: LessonPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 text-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
          <div className="min-w-0 pr-4">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{isEnrolled ? "Học bài giảng" : "Học thử miễn phí"}</span>
            <h3 className="text-base font-black truncate">{lesson.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer">✕</button>
        </div>

        <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[450px]">
          {lesson.url ? (
            lesson.type === "VIDEO" ? (
              <div className="w-full max-w-4xl mx-auto"><VideoPlayer src={lesson.url} title={lesson.title || "Video bài giảng"} /></div>
            ) : (
              <div className="p-8 text-slate-300 text-center max-w-lg space-y-4">
                <FileText className="w-16 h-16 text-indigo-400 mx-auto" />
                <h4 className="text-xl font-bold text-white">Nội dung tài liệu đính kèm</h4>
                <p className="text-sm font-medium">Đường dẫn tài liệu: <a href={lesson.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{lesson.url}</a></p>
                <p className="text-xs text-slate-400">Tài liệu đầy đủ đang được đính kèm ở định dạng PDF/Markdown. Vui lòng bấm vào liên kết để đọc hoặc tải về.</p>
              </div>
            )
          ) : (
            <div className="p-8 text-center max-w-md space-y-4">
              <PlayCircle className="w-16 h-16 text-indigo-500 mx-auto" />
              <h4 className="text-xl font-black">Video bài giảng giả lập</h4>
              <p className="text-slate-400 text-sm font-medium">(Demo) Video cho bài học này hiện chưa được liên kết file vật lý trên cloud. Bạn có thể tự upload video ở dashboard giảng viên để kiểm tra tính năng đầy đủ.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-800 text-center border-t border-slate-700">
          {!isEnrolled && (
            <button onClick={onCheckout} className="px-6 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 text-sm cursor-pointer inline-flex items-center gap-2">
              Đăng ký khóa học để mở khóa toàn bộ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

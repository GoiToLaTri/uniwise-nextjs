"use client";

import { useState, useRef } from "react";
import { VideoPlayer } from "@/components/shared/video-player";
import { FileText, MessageCircle, FileBox } from "lucide-react";
import { useSyncVideoPosition, useCompleteLesson } from "@/hooks/use-learning-progress";
import { toast } from "sonner";
import { type CourseLesson } from "@/interfaces/course.interface";

interface LessonContentProps {
  lesson: CourseLesson | null;
  videoUrl: string;
  courseId: string;
}

export function LessonContent({ lesson, videoUrl, courseId }: LessonContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Hooks cho việc cập nhật tiến độ
  const { mutate: syncPosition } = useSyncVideoPosition(lesson?.id || "");
  const { mutate: completeLesson } = useCompleteLesson(lesson?.id || "", courseId);

  const lastSyncedTimeRef = useRef<number>(0);

  const handleTimeUpdate = (time: number) => {
    if (!lesson?.id) return;
    
    // Đồng bộ mỗi 10 giây
    if (Math.abs(time - lastSyncedTimeRef.current) >= 10) {
      syncPosition(Math.floor(time));
      lastSyncedTimeRef.current = time;
    }
  };

  const handleVideoEnd = () => {
    if (!lesson?.id) return;
    completeLesson(undefined, {
      onSuccess: () => {
        toast.success("Chúc mừng bạn đã hoàn thành bài học!");
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      {/* Video Player Area */}
      <div className="w-full aspect-video flex items-center justify-center shrink-0 p-4 md:p-6">
        <div className="w-full h-full bg-black rounded-2xl overflow-hidden flex items-center justify-center">
          {lesson ? (
            lesson.lessonType === "VIDEO" && videoUrl ? (
              <VideoPlayer 
                src={videoUrl} 
                title={lesson.title} 
                onTimeUpdate={handleTimeUpdate}
                onEnd={handleVideoEnd}
                initialTime={lesson.lastWatchedPosition || 0}
              />
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <FileText className="w-16 h-16 mb-4 text-slate-600" />
                <p className="text-lg font-bold text-slate-300">Bài học văn bản / Tài liệu</p>
                <p className="text-sm mt-2 text-slate-500">Vui lòng đọc nội dung bên dưới.</p>
              </div>
            )
          ) : (
            <div className="text-slate-400">Vui lòng chọn một bài học để bắt đầu</div>
          )}
        </div>
      </div>

      {/* Tabs Area */}
      <div className="flex-1 bg-white p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {lesson && (
            <h2 className="text-2xl font-black text-slate-900 mb-6">{lesson.title}</h2>
          )}
          
          <div className="w-full">
            {/* Custom Tab Navigation */}
            <div className="flex items-center gap-8 border-b border-slate-200">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 font-bold text-sm border-b-2 transition-colors outline-hidden cursor-pointer ${
                  activeTab === "overview"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("qna")}
                className={`py-3 font-bold text-sm border-b-2 transition-colors outline-hidden cursor-pointer ${
                  activeTab === "qna"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Hỏi đáp
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`py-3 font-bold text-sm border-b-2 transition-colors outline-hidden cursor-pointer ${
                  activeTab === "resources"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Tài liệu đính kèm
              </button>
            </div>

            {/* Custom Tab Content */}
            <div className="py-6">
              {activeTab === "overview" && (
                <div className="prose prose-slate max-w-none text-slate-600 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <p>Chào mừng bạn đến với bài học <strong>{lesson?.title}</strong>.</p>
                  <p>Nội dung chi tiết của bài học đang được hiển thị ở đây. (Tính năng mô tả bài học đang được cập nhật).</p>
                </div>
              )}

              {activeTab === "qna" && (
                <div className="text-center text-slate-500 py-12 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-medium">Chưa có câu hỏi nào cho bài học này.</p>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="text-center text-slate-500 py-12 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <FileBox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-medium">Không có tài liệu đính kèm cho bài học này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

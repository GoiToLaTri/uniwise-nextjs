"use client";

import { Award, BookOpen, Clock, HelpCircle, Play, Tv } from "lucide-react";
import { RemoteImage } from "@/components/shared/remote-image";
import { type CourseLesson, type CourseResponse } from "@/interfaces/course.interface";

const courseBenefits = [
  { icon: BookOpen, text: "Truy cập toàn bộ tài liệu giảng dạy" },
  { icon: Clock, text: "Sở hữu trọn đời, học mọi lúc mọi nơi" },
  { icon: Award, text: "Chứng nhận hoàn thành khóa học UniWise" },
  { icon: HelpCircle, text: "Hỗ trợ giải đáp thắc mắc trực tuyến 24/7" },
];

interface CourseEnrollmentCardProps {
  course: CourseResponse;
  isEnrolled: boolean;
  priceDisplay: string;
  totalLessons: number;
  onCheckout: () => void;
  onLessonOpen: (lesson: CourseLesson) => void;
  onStartLearning: () => void;
}

export function CourseEnrollmentCard({
  course,
  isEnrolled,
  priceDisplay,
  totalLessons,
  onCheckout,
  onLessonOpen,
  onStartLearning,
}: CourseEnrollmentCardProps) {
  const firstPreviewLesson = course.sections
    .flatMap((section) => section.lessons)
    .find((lesson) => lesson.isPreview);

  return (
    <div className="relative">
      <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center border-b border-slate-100">
          {course.thumbnailUrl ? (
            <RemoteImage src={course.thumbnailUrl} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center text-slate-400 bg-linear-to-br from-indigo-50 to-purple-50">
              <BookOpen className="w-12 h-12 text-indigo-200 mb-2" />
              <span className="text-[12px] font-black uppercase text-indigo-300 tracking-widest">UNIWISE</span>
            </div>
          )}

          {!isEnrolled && firstPreviewLesson && (
            <button onClick={() => onLessonOpen(firstPreviewLesson)} className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/45 transition-colors cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-white/95 text-indigo-600 shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Play className="w-6 h-6 fill-indigo-600 translate-x-0.5" />
              </div>
            </button>
          )}
        </div>

        <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-slate-900">{priceDisplay}</span>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Cam kết hoàn tiền trong 7 ngày nếu không hài lòng</p>
          </div>

          {isEnrolled ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span>Tiến độ học tập</span>
                  <span>{Math.round(course.progressPercentage || 0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${course.progressPercentage || 0}%` }} />
                </div>
                <span className="text-xs text-slate-500 font-medium block">
                  Đã hoàn thành {course.completedLessonsCount || 0}/{course.totalLessonsCount || totalLessons} bài học
                </span>
              </div>
              <button onClick={onStartLearning} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md">
                <Tv className="w-5 h-5" /> Vào học ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={onCheckout} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md">
                Đăng ký học ngay
              </button>
              {firstPreviewLesson && (
                <button onClick={() => onLessonOpen(firstPreviewLesson)} className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                  Học thử miễn phí
                </button>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 space-y-3">
            <span className="text-xs text-slate-400 font-black uppercase tracking-wider block">Khóa học bao gồm:</span>
            <div className="space-y-2">
              {courseBenefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-slate-600 font-bold">
                  <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

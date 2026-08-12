import { Check, Sparkles } from "lucide-react";
import { type CourseResponse } from "@/interfaces/course.interface";

const benefits = [
  "Làm chủ kiến thức cốt lõi và các mô hình nâng cao",
  "Thực hành thực tế thông qua các bài tập và ví dụ minh họa",
  "Nhận được tài liệu độc quyền và hỗ trợ từ giảng viên",
  "Tư duy giải quyết vấn đề và tối ưu hóa dự án thực tế",
];

export function CourseDescriptionCard({ course }: { course: CourseResponse }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" /> Giới thiệu khóa học
      </h2>
      <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line space-y-3">
        {course.description || (
          <p>
            Chào mừng bạn đến với khóa học <strong>{course.title}</strong>. Khóa học được thiết kế bài bản với mục tiêu cung cấp cho bạn kiến thức chuyên sâu và kỹ năng thực hành vững chắc trong lĩnh vực này.
          </p>
        )}
        <p className="mt-4"><strong>Những gì bạn sẽ đạt được sau khóa học:</strong></p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

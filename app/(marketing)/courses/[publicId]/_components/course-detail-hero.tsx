"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RemoteImage } from "@/components/shared/remote-image";
import { type CourseResponse } from "@/interfaces/course.interface";

interface CourseDetailHeroProps {
  course: CourseResponse;
  totalLessons: number;
}

export function CourseDetailHero({ course, totalLessons }: CourseDetailHeroProps) {
  const instructor = course.instructor;

  return (
    <div className="relative pt-28 pb-16 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="container mx-auto px-4 relative flex flex-col gap-6">
        <Link href="/courses" className="inline-flex w-fit items-center gap-2 text-indigo-200 hover:text-white font-bold transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách khóa học
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-indigo-600/50 text-indigo-200 border-none hover:bg-indigo-600/50 font-bold backdrop-blur-md">
                Khóa học nổi bật
              </Badge>
              {course.status && (
                <Badge className="bg-white/10 text-slate-200 border-none hover:bg-white/10 font-bold backdrop-blur-md">
                  {course.status}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">{course.title}</h1>
            <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-3xl line-clamp-3">
              {course.description || "Chưa có mô tả chi tiết cho khóa học này. Hãy đăng ký ngay để trải nghiệm lộ trình học cùng chuyên gia."}
            </p>

            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white font-bold">5.0</span>
                <span className="text-slate-500">(128 đánh giá)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{totalLessons} bài giảng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Cập nhật mới nhất: {new Date(course.updatedAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="relative w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-md overflow-hidden">
                {instructor?.avatarUrl ? (
                  <RemoteImage src={instructor.avatarUrl} alt={instructor.name} fill sizes="40px" className="object-cover" />
                ) : (
                  instructor?.name?.charAt(0) || "U"
                )}
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Giảng viên</span>
                {instructor?.publicId ? (
                  <Link href={`/u/${instructor.publicId}`} className="text-white hover:text-indigo-400 transition-colors font-bold text-base hover:underline">
                    {instructor.name}
                  </Link>
                ) : (
                  <span className="text-slate-200 font-bold">Giảng viên UniWise</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

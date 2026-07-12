"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, BookOpen } from "lucide-react";
import { CourseResponse } from "@/interfaces/course.interface";
import { PriceTierResponse } from "@/hooks/use-price-tier";
import { useProfileByAccountId } from "@/hooks/use-profile";
import Link from "next/link";

interface CourseCardProps {
  course: CourseResponse;
  priceTiers: PriceTierResponse[];
}

export function CourseCard({ course, priceTiers }: CourseCardProps) {
  // Tải thông tin giảng viên dựa trên creatorId (accountId)
  const { data: instructorProfile } = useProfileByAccountId(course.creatorId);
  const instructorName = instructorProfile?.name || "Giảng viên UniWise";

  // Tìm thông tin định giá
  const priceTier = priceTiers.find((tier) => tier.id === course.priceTierId);
  const formattedPrice = priceTier
    ? `${new Intl.NumberFormat().format(priceTier.priceAmount)}đ`
    : "Miễn phí";

  const totalLessons = course.totalLessons || course.totalLessonsCount || course.sections?.reduce(
    (total, sec) => total + (sec.lessons?.length || 0), 0
  ) || 0;

  const rating = course.averageRating ? course.averageRating.toFixed(1) : "5.0";

  return (
    <Card className="group border-slate-200 bg-white/90 backdrop-blur-md rounded-xl overflow-hidden hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col h-full">
      <Link href={`/courses/${course.publicId}`} className="block relative aspect-video overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
        {course.thumbnailUrl ? (
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center text-slate-400 bg-linear-to-br from-indigo-50 to-purple-50">
            <BookOpen className="w-10 h-10 text-indigo-200 mb-2" />
            <span className="text-[10px] font-black uppercase text-indigo-300">UNIWISE</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-indigo-600 hover:bg-white font-bold backdrop-blur-sm border-none shadow-xs">
            Khóa học
          </Badge>
        </div>
      </Link>
      
      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-slate-600">{rating}</span>
            <span className="text-slate-200">•</span>
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{totalLessons} bài học</span>
          </div>
          
          <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
            <Link href={`/courses/${course.publicId}`}>
              {course.title}
            </Link>
          </h3>
        </div>
        <p className="text-slate-500 text-sm font-medium italic mt-2">
          Giảng viên:{" "}
          {instructorProfile ? (
            <Link 
              href={`/u/${instructorProfile.publicId}`} 
              className="text-indigo-600 hover:underline font-semibold not-italic"
            >
              {instructorName}
            </Link>
          ) : (
            <span className="text-slate-600">{instructorName}</span>
          )}
        </p>
      </CardContent>

      <CardFooter className="px-6 pb-6 flex items-center justify-between gap-4">
        <div className="text-2xl font-black text-indigo-600">{formattedPrice}</div>
        <Link href={`/courses/${course.publicId}`}>
          <button className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white transition-all active:scale-95 text-sm font-bold flex items-center justify-center cursor-pointer">
            Xem chi tiết
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
}
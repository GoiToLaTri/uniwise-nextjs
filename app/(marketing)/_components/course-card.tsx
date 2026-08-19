"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, BookOpen } from "lucide-react";
import { CourseSearchResponse } from "@/interfaces/course.interface";
import { PriceTierResponse } from "@/hooks/use-price-tier";
import Link from "next/link";
import { RemoteImage } from "@/components/shared/remote-image";
import { formatCurrencyAmount } from "@/lib/currency";

interface CourseCardProps {
  course: CourseSearchResponse;
  priceTiers: PriceTierResponse[];
}

export function CourseCard({ course, priceTiers }: CourseCardProps) {
  const instructorName = course.instructor?.name || "Giảng viên UniWise";

  // Tìm thông tin định giá
  const priceTier = priceTiers.find((tier) => tier.id === course.priceTierId);
  const formattedPrice =
    !course.priceTierId || priceTier?.priceAmount === 0
      ? "Miễn phí"
      : priceTier
        ? formatCurrencyAmount(priceTier.priceAmount, priceTier.currency)
        : "Chưa xác định";

  const totalLessons = course.totalLessons || 0;

  const rating =
    course.averageRating !== null && (course.totalReviews ?? 0) > 0
      ? course.averageRating.toFixed(1)
      : "Mới";

  return (
    <Card className="group border-slate-200 bg-white/90 backdrop-blur-md rounded-xl overflow-hidden hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col h-full">
      <Link href={`/courses/${course.publicId}`} className="block relative aspect-video overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
        {course.thumbnailUrl ? (
          <RemoteImage
            src={course.thumbnailUrl} 
            alt={course.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
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
          {course.instructor?.publicId ? (
            <Link
              href={`/u/${course.instructor.publicId}`}
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

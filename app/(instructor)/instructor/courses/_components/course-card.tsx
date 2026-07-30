"use client";

import * as React from "react";
import { 
  MoreVertical, Edit3, Trash2, BookOpen, Layers, 
  PlayCircle, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CourseSearchResponse } from "@/interfaces/course.interface";
import { PriceTierResponse } from "@/hooks/use-price-tier";
import { useDeleteCourse } from "@/hooks/use-course";
import { CourseFormDialog } from "./course-form-dialog";
import Link from "next/link";

interface CourseCardProps {
  course: CourseSearchResponse;
  priceTiers: PriceTierResponse[];
  onRefresh: () => void;
}

export function CourseCard({ course, priceTiers, onRefresh }: CourseCardProps) {
  const deleteMutation = useDeleteCourse();
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Tìm thông tin price tier để hiển thị giá tiền thực tế
  const priceTier = priceTiers.find((tier) => tier.id === course.priceTierId);
  const formattedPrice = priceTier
    ? `${new Intl.NumberFormat().format(priceTier.priceAmount)} ${priceTier.currency}`
    : "Miễn phí / Chưa định giá";

  const totalLessons = course.totalLessons || 0;

  const totalSections = course.totalSections || 0;

  const handleDelete = async () => {
    if (confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.title}"?`)) {
      setIsDeleting(true);
      try {
        await deleteMutation.mutateAsync(course.publicId);
        onRefresh();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Trạng thái Badge styling
  const statusConfig = {
    DRAFT: { color: "text-slate-600 bg-slate-100 border-slate-200", label: "Bản nháp" },
    PUBLISHED: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", label: "Công khai" },
    PENDING: { color: "text-amber-600 bg-amber-50 border-amber-100", label: "Đang duyệt" },
  };

  const statusInfo = statusConfig[course.status as keyof typeof statusConfig] || {
    color: "text-blue-600 bg-blue-50 border-blue-100",
    label: course.status,
  };

  return (
    <Card className="group relative overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_rgba(79,70,229,0.02)] rounded-2xl hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] hover:border-indigo-100 transition-all duration-500 flex flex-col h-full">
      {/* 1. Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center text-slate-400 bg-linear-to-br from-indigo-50 to-purple-50">
            <BookOpen className="w-10 h-10 text-indigo-200 mb-2" />
            <span className="text-[10px] font-black uppercase text-indigo-300">UNIWISE Course</span>
          </div>
        )}

        {/* Status Badge overlay */}
        <Badge variant="outline" className={cn("absolute top-3 left-3 px-2.5 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest border", statusInfo.color)}>
          {statusInfo.label}
        </Badge>

        {/* Quick actions inside image container for styling */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                disabled={isDeleting}
                className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 shadow-md transition-all active:scale-95"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MoreVertical className="w-3.5 h-3.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 border-slate-200 shadow-xl animate-in zoom-in-95 duration-200">
              <CourseFormDialog initialData={course} onSuccess={onRefresh}>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer py-2"
                >
                  <Edit3 className="w-4 h-4 mr-2 text-slate-400" /> Sửa thông tin
                </DropdownMenuItem>
              </CourseFormDialog>

              <Link href={`/instructor/courses/${course.publicId}`}>
                <DropdownMenuItem className="rounded-lg font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer py-2">
                  <Layers className="w-4 h-4 mr-2 text-slate-400" /> Dựng giáo trình
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator className="my-1 border-slate-100" />

              <DropdownMenuItem
                onClick={handleDelete}
                className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer py-2"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa khóa học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Course Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-black text-slate-900 tracking-tight leading-snug line-clamp-2 text-base group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-2 italic">
            {course.description || "Không có mô tả chi tiết cho khóa học này."}
          </p>
        </div>

        {/* 3. Course Details (lessons count, section count, price) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              {totalSections} Chương
            </span>
            <span className="flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
              {totalLessons} Bài học
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Định giá
            </span>
            <span className="text-sm font-black text-indigo-600">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

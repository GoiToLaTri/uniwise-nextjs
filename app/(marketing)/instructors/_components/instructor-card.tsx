"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, User, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PublicInstructorSearchResponse } from "@/interfaces/instructor.interface";

interface InstructorCardProps {
  instructor: PublicInstructorSearchResponse;
}

interface InstructorAvatarProps {
  src: string | null;
  name: string;
}

function InstructorAvatar({ src, name }: InstructorAvatarProps) {
  const [hasError, setHasError] = React.useState(false);
  const initials = name.charAt(0).toUpperCase() || "I";

  if (!src || src === "null" || hasError) {
    return (
      <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-600 via-purple-500 to-blue-500">
        <div className="flex h-[80%] w-[80%] items-center justify-center rounded-full bg-white/95 shadow-inner">
          <span className="text-2xl font-black text-indigo-600">{initials}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="object-cover w-full h-full"
      onError={() => setHasError(true)}
    />
  );
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  const displayName = instructor.professionalName || instructor.name;
  const expertiseNames = (instructor.expertises || [])
    .slice(0, 2)
    .map((expertise) => expertise.name)
    .filter(Boolean)
    .join(" • ");

  return (
    <Card className="group border-slate-200 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
      {/* Top Background Pattern/Gradient */}
      <div className="h-24 bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-blue-500/10 group-hover:from-indigo-500/20 group-hover:via-purple-500/10 group-hover:to-blue-500/20 transition-all duration-500 relative" />

      {/* Avatar Container - shifted up */}
      <div className="px-6 -mt-12 flex justify-start relative z-10">
        <div className="relative shrink-0 aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-lg w-24 h-24 group-hover:scale-105 transition-transform duration-500 bg-white flex items-center justify-center">
          <InstructorAvatar
            key={instructor.avatarUrl || "fallback"}
            src={instructor.avatarUrl}
            name={displayName}
          />
        </div>
      </div>

      {/* Card Body */}
      <CardContent className="px-6 pt-4 pb-2 flex-1 flex flex-col gap-4">
        <div className="space-y-1.5">
          <Link href={`/u/${instructor.publicId}`} className="inline-block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">
              {displayName}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <User className="w-3.5 h-3.5" />
            {instructor.professionalName && instructor.professionalName !== instructor.name
              ? instructor.name
              : "Giảng viên UniWise"}
          </div>
        </div>

        {/* Biography */}
        <p className="text-slate-500 text-sm font-semibold leading-relaxed line-clamp-3 flex-1">
          {instructor.headline ||
            instructor.biography ||
            "Giảng viên chưa cập nhật phần giới thiệu chuyên môn."}
        </p>

        {/* Public expertise */}
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">
            {expertiseNames ||
              (instructor.yearsOfExperience
                ? `${instructor.yearsOfExperience} năm kinh nghiệm`
                : "Thông tin chuyên môn đang cập nhật")}
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-2">
        <Link href={`/u/${instructor.publicId}`} className="w-full">
          <button className="w-full h-11 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white transition-all active:scale-95 text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-slate-100 group-hover:border-indigo-600 group-hover:shadow-indigo-100 duration-500">
            Xem hồ sơ <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
}

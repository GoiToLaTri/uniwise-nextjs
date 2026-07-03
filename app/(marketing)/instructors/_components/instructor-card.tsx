"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, User, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProfileResponse } from "@/interfaces/response/profile-response.interface";

interface InstructorCardProps {
  instructor: ProfileResponse;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  const initials = instructor.name?.charAt(0).toUpperCase() || "I";
  const [imgSrc, setImgSrc] = React.useState(instructor.avatarUrl);

  React.useEffect(() => {
    setImgSrc(instructor.avatarUrl);
  }, [instructor.avatarUrl]);

  return (
    <Card className="group border-slate-200 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
      {/* Top Background Pattern/Gradient */}
      <div className="h-24 bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-blue-500/10 group-hover:from-indigo-500/20 group-hover:via-purple-500/10 group-hover:to-blue-500/20 transition-all duration-500 relative" />

      {/* Avatar Container - shifted up */}
      <div className="px-6 -mt-12 flex justify-start relative z-10">
        <div className="relative shrink-0 aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-lg w-24 h-24 group-hover:scale-105 transition-transform duration-500 bg-white flex items-center justify-center">
          {imgSrc && imgSrc !== "null" ? (
            <img 
              src={imgSrc} 
              alt={instructor.name} 
              className="object-cover w-full h-full"
              onError={() => {
                // Hủy hiển thị thẻ img và kích hoạt Fallback UI
                setImgSrc("");
              }}
            />
          ) : (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-600 via-purple-500 to-blue-500">
              <div className="flex h-[80%] w-[80%] items-center justify-center rounded-full bg-white/95 shadow-inner">
                <span className="text-2xl font-black text-indigo-600">{initials}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <CardContent className="px-6 pt-4 pb-2 flex-1 flex flex-col gap-4">
        <div className="space-y-1.5">
          <Link href={`/u/${instructor.publicId}`} className="inline-block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">
              {instructor.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <User className="w-3.5 h-3.5" />
            Giảng viên
          </div>
        </div>

        {/* Biography */}
        <p className="text-slate-500 text-sm font-semibold leading-relaxed line-clamp-3 flex-1">
          {instructor.bio || "Chưa có tiểu sử tóm tắt cho giảng viên này. Hãy xem hồ sơ cá nhân để tìm hiểu thêm."}
        </p>

        {/* Contact Info */}
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="truncate">{instructor.email || "Email chưa công khai"}</span>
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

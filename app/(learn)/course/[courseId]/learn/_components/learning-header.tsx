"use client";

import Link from "next/link";
import { ArrowLeft, Menu, Award, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LearningHeaderProps {
  courseTitle: string;
  progressPercentage: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function LearningHeader({
  courseTitle,
  progressPercentage,
  sidebarOpen,
  onToggleSidebar
}: LearningHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-slate-950 text-white shrink-0 z-10 border-b border-slate-800">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 overflow-hidden">
        
        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center gap-2 group mr-2 shrink-0">
          <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-white">
            UNIWISE
          </span>
        </Link>

        {/* Back Button */}
        <Link href="/my-courses" className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4 text-slate-200" />
        </Link>
        
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />
        
        <h1 className="font-bold text-sm sm:text-base truncate pr-4 text-slate-200">
          {courseTitle}
        </h1>
      </div>
      
      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden md:flex items-center gap-3 w-48">
           <div className="flex-1">
              <Progress value={progressPercentage} className="h-2 bg-slate-800 [&>div]:bg-indigo-500" />
           </div>
           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 shrink-0">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>{progressPercentage}%</span>
           </div>
        </div>
        
        <button 
          onClick={onToggleSidebar}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-bold cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline">Nội dung khóa học</span>
        </button>
      </div>
    </header>
  );
}

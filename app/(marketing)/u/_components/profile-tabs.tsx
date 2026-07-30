"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Import các sub-components
import { InstructorCourses } from "./_sections/instructor-courses";
import { InstructorReviews } from "./_sections/instructor-reviews";
import { InstructorBio } from "./_sections/instructor-bio";
import { StudentCourses } from "./_sections/student-courses";
import { StudentCerts } from "./_sections/student-certs";
import { StudentActivity } from "./_sections/student-activity";
import { AdminPosts } from "./_sections/admin-posts";

import { PublicInstructorProfileResponse } from "@/interfaces/instructor.interface";

const TABS_CONFIG = [
  { id: "ins-courses", label: "Khóa học đang dạy", role: "INSTRUCTOR" },
  { id: "ins-reviews", label: "Đánh giá", role: "INSTRUCTOR" },
  { id: "ins-bio", label: "Giới thiệu", role: "INSTRUCTOR" },
  { id: "stu-courses", label: "Khóa học", role: "STUDENT" },
  { id: "stu-certs", label: "Chứng chỉ", role: "STUDENT" },
  { id: "stu-activity", label: "Hoạt động", role: "STUDENT" },
  { id: "admin-posts", label: "Thông báo & Bài viết", role: "ADMIN" },
] as const;

interface ProfileTabsProps {
  roles: string[];
  instructorProfile?: PublicInstructorProfileResponse | null;
  profilePublicId?: string;
}

export function ProfileTabs({
  roles,
  instructorProfile,
  profilePublicId,
}: ProfileTabsProps) {
  // 1. Mapping Component theo ID
  const COMPONENT_MAP: Record<string, React.ReactNode> = {
    "ins-courses": profilePublicId ? (
      <InstructorCourses
        key={profilePublicId}
        profilePublicId={profilePublicId}
      />
    ) : null,
    "ins-reviews": <InstructorReviews />,
    "ins-bio": instructorProfile ? (
      <InstructorBio profile={instructorProfile} />
    ) : null,
    "stu-courses": <StudentCourses />,
    "stu-certs": <StudentCerts />,
    "stu-activity": <StudentActivity />,
    "admin-posts": <AdminPosts />,
  };

  const activeTabs = React.useMemo(() => TABS_CONFIG.filter(t => roles.includes(t.role)), [roles]);

  const [activeTabId, setActiveTabId] = React.useState(() => {
    if (roles.includes("INSTRUCTOR")) return "ins-courses";
    if (roles.includes("STUDENT")) return "stu-courses";
    return activeTabs[0]?.id;
  });

  if (activeTabs.length === 0) return null;

  return (
    <div className="flex w-full flex-col space-y-10">
      {/* NAVIGATION THỦ CÔNG */}
      <nav className="w-full border-b border-slate-200">
        <div className="flex h-auto w-full justify-start gap-8 overflow-x-auto no-scrollbar">
          {activeTabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "group relative flex items-center justify-center bg-transparent cursor-pointer outline-none",
                  "px-1 pb-4 pt-2 transition-all duration-300 active:scale-95",
                  "text-[11px] font-black uppercase tracking-[0.2em] antialiased whitespace-nowrap",
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.label}
                <div className={cn(
                  "absolute bottom-[-1px] left-0 h-[3.5px] rounded-t-full transition-all duration-300 ease-in-out",
                  "bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500",
                  isActive ? "w-full opacity-100" : "w-0 opacity-0"
                )} />
              </button>
            );
          })}
        </div>
      </nav>

      {/* HIỂN THỊ NỘI DUNG TỪ COMPONENT MAP */}
      <div className="w-full">
        <div 
          key={activeTabId} 
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out"
        >
          {COMPONENT_MAP[activeTabId]}
        </div>
      </div>
    </div>
  );
}

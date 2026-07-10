"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCourse } from "@/hooks/use-course";
import { BookOpen } from "lucide-react";
import { LearningHeader } from "./_components/learning-header";
import { LearningSidebar } from "./_components/learning-sidebar";
import { LessonContent } from "./_components/lesson-content";

export default function LearningWorkspacePage() {
  const { courseId } = useParams<{ courseId: string }>(); // Actually publicId
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonIdParam = searchParams.get("lessonId");
  
  const { data: course, isLoading } = useCourse(courseId);

  // State
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Find active lesson
  const activeLesson = React.useMemo(() => {
    if (!course?.sections) return null;
    
    // Nếu có tham số lessonId trên URL
    if (lessonIdParam) {
      for (const section of course.sections) {
        const found = section.lessons?.find(l => l.id === lessonIdParam);
        if (found) return found;
      }
    }
    
    // Nếu không có, mặc định bài đầu tiên
    return course.sections.flatMap(s => s.lessons || [])[0] || null;
  }, [course, lessonIdParam]);

  // Xác định video URL
  const videoUrl = React.useMemo(() => {
    if (!activeLesson || activeLesson.lessonType !== "VIDEO" || !activeLesson.contentReference) return "";
    
    let lessonInternalId = activeLesson.contentReference;
    const match = activeLesson.contentReference.match(/lessons\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      lessonInternalId = match[1];
    } else if (lessonInternalId.includes('/')) {
      const parts = lessonInternalId.split('/').filter(p => p && !p.includes('.m3u8') && !p.startsWith('http'));
      if (parts.length > 0) lessonInternalId = parts[parts.length - 1];
    }
    
    return `/api/proxy/media-service/api/v1/streaming/lessons/${lessonInternalId}/playlist.m3u8`;
  }, [activeLesson]);

  const handleLessonSelect = (lessonId: string) => {
    router.push(`/course/${courseId}/learn?lessonId=${lessonId}`);
  };

  if (isLoading || !course) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-white min-h-screen">
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 text-indigo-500 animate-pulse mx-auto" />
          <h2 className="text-xl font-bold">Đang tải không gian học tập...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <LearningHeader 
        courseTitle={course.title}
        progressPercentage={course.progressPercentage || 0}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ─── MAIN WORKSPACE ──────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: VIDEO & TABS */}
        <div className={`flex-1 flex flex-col transition-all duration-300 overflow-y-auto ${sidebarOpen ? 'lg:pr-[350px]' : ''}`}>
          <LessonContent 
            lesson={activeLesson}
            videoUrl={videoUrl}
            courseId={courseId}
          />
        </div>

        {/* RIGHT PANEL: CURRICULUM SIDEBAR */}
        <LearningSidebar 
          sections={course.sections || []}
          activeLessonId={activeLesson?.id}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLessonSelect={handleLessonSelect}
        />
        
      </div>
    </div>
  );
}

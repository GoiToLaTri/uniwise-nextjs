"use client";

import { useState } from "react";
import { useMyCourses } from "@/hooks/use-learning-progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { UserCourseDto } from "@/interfaces/course.interface";
import { RemoteImage } from "@/components/shared/remote-image";

export default function MyCoursesPage() {
  const [page, setPage] = useState(1);
  const [activeTabId, setActiveTabId] = useState("all");
  const size = 12;

  const { data: myCoursesData, isLoading, error } = useMyCourses(page, size);

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="text-center bg-red-50 text-red-600 p-6 rounded-2xl max-w-md w-full border border-red-100 shadow-sm">
          <h2 className="text-xl font-black mb-2 tracking-tight">Đã xảy ra lỗi</h2>
          <p className="font-medium text-red-500/80">
            Không thể tải danh sách khóa học của bạn lúc này. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  // Client-side filtering function for demonstration (backend doesn't support filter yet)
  const filterCourses = (status: "all" | "learning" | "completed", courses: UserCourseDto[]) => {
    if (status === "all") return courses;
    if (status === "learning") return courses.filter((c) => c.progressPercentage < 100);
    if (status === "completed") return courses.filter((c) => c.progressPercentage === 100);
    return courses;
  };

  const renderCourseGrid = (status: "all" | "learning" | "completed") => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      );
    }

    if (!myCoursesData?.content || myCoursesData.content.length === 0) {
      return (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.02)] max-w-2xl mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
            <BookOpen className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
            Bạn chưa tham gia khóa học nào
          </h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
            Hãy khám phá các khóa học chất lượng cao và bắt đầu học ngay hôm nay.
          </p>
          <Link href="/courses">
            <button className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
              Khám phá khóa học ngay
            </button>
          </Link>
        </div>
      );
    }

    const filteredCourses = filterCourses(status, myCoursesData.content);

    if (filteredCourses.length === 0) {
      return (
        <div className="text-center py-16 text-slate-500 font-medium">
          Không có khóa học nào trong mục này.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course: UserCourseDto) => (
          <Card
            key={course.courseId}
            className="group border-slate-200 bg-white rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col h-full hover:-translate-y-1"
          >
            <Link href={`/course/${course.publicId}/learn`} className="block relative aspect-video overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
              {course.thumbnail ? (
                <RemoteImage
                  src={course.thumbnail} 
                  alt={course.title} 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center text-indigo-200 bg-linear-to-br from-indigo-50 to-purple-50">
                  <BookOpen className="w-10 h-10 mb-2 drop-shadow-sm opacity-80" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    UNIWISE
                  </span>
                </div>
              )}
              
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-white/90 text-indigo-600 font-bold backdrop-blur-sm border-none shadow-xs">
                  {course.progressPercentage === 100 ? "Hoàn thành" : "Đang học"}
                </Badge>
              </div>
            </Link>

            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight mb-3 text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  <Link href={`/course/${course.publicId}/learn`}>
                    {course.title}
                  </Link>
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-5">
                  Đã ghi danh:{" "}
                  {course.enrolledAt
                    ? format(new Date(course.enrolledAt), "dd/MM/yyyy", { locale: vi })
                    : "Gần đây"}
                </p>
              </div>
              
              <div className="mt-auto space-y-2.5">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-slate-500">Tiến độ học tập</span>
                  <span className={course.progressPercentage === 100 ? "text-emerald-500" : "text-indigo-600"}>
                    {course.progressPercentage}%
                  </span>
                </div>
                <Progress 
                  value={course.progressPercentage} 
                  className="h-2.5 rounded-full bg-slate-100" 
                />
              </div>
            </CardContent>

            <CardFooter className="px-5 pb-5 pt-0">
              <Link href={`/course/${course.publicId}/learn`} className="w-full">
                <button className="w-full h-11 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white transition-all active:scale-95 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200 hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white">
                  <PlayCircle className="w-4 h-4" />
                  {course.progressPercentage === 0 ? "Bắt đầu học" : course.progressPercentage === 100 ? "Học lại" : "Tiếp tục học"}
                </button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const TABS_CONFIG = [
    { id: "all", label: "Tất cả khóa học" },
    { id: "learning", label: "Đang học" },
    { id: "completed", label: "Đã hoàn thành" },
    { id: "certificates", label: "Chứng chỉ" },
    { id: "wishlist", label: "Yêu thích" },
    { id: "history", label: "Lịch sử mua" },
  ];

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white pt-8 px-6 sm:px-10">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 pb-6">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-black text-2xl md:text-3xl tracking-tight text-slate-800">
                Góc học tập
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Quản lý tiến độ học tập, chứng chỉ và các khóa học của bạn
              </p>
            </div>
          </div>
          
          {/* Custom Tabs Navigation */}
          <nav className="w-full">
            <div className="flex h-auto w-full justify-start gap-8 overflow-x-auto no-scrollbar">
              {TABS_CONFIG.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`group relative flex items-center justify-center bg-transparent cursor-pointer outline-none px-1 pb-4 pt-2 transition-all duration-300 active:scale-95 text-[11px] font-black uppercase tracking-[0.2em] antialiased whitespace-nowrap ${
                      isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab.label}
                    <div className={`absolute bottom-[-1px] left-0 h-[3.5px] rounded-t-full transition-all duration-300 ease-in-out bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500 ${
                      isActive ? "w-full opacity-100" : "w-0 opacity-0"
                    }`} />
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {activeTabId === "all" && renderCourseGrid("all")}
          {activeTabId === "learning" && renderCourseGrid("learning")}
          {activeTabId === "completed" && renderCourseGrid("completed")}
          
          {/* Placeholders for new suggested tabs */}
          {activeTabId === "certificates" && (
            <div className="text-center py-20 text-slate-500 font-medium">
              Bạn chưa có chứng chỉ nào. Cố gắng hoàn thành khóa học để nhận chứng chỉ nhé!
            </div>
          )}
          {activeTabId === "wishlist" && (
            <div className="text-center py-20 text-slate-500 font-medium">
              Chưa có khóa học nào trong danh sách yêu thích.
            </div>
          )}
          {activeTabId === "history" && (
            <div className="text-center py-20 text-slate-500 font-medium">
              Lịch sử giao dịch trống.
            </div>
          )}
        </div>

        {/* Phân trang (chỉ hiện khi xem danh sách khóa học) */}
        {["all", "learning", "completed"].includes(activeTabId) && myCoursesData && myCoursesData.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Trước
              </button>
              <button 
                disabled={page === myCoursesData.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

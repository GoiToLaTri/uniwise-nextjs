"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCourse } from "@/hooks/use-course";
import { usePriceTier } from "@/hooks/use-price-tier";
import { useCreatePayment } from "@/hooks/use-payment";
import { CourseLesson } from "@/interfaces/course.interface";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/shared/video-player";
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  PlayCircle, 
  FileText, 
  Lock, 
  CheckCircle, 
  ArrowLeft, 
  Award, 
  Tv, 
  Sparkles, 
  Check,
  AlertCircle,
  HelpCircle,
  Play
} from "lucide-react";

export default function CourseDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();

  // 1. Fetch dữ liệu khóa học
  const { data: course, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourse(publicId);

  // 2. Thông tin công khai của giảng viên đã nằm trong course response.
  const instructor = course?.instructor;

  // 3. Fetch bảng định giá (priceTierId)
  const priceTierId = course?.priceTierId || "";
  const { data: priceTier, isLoading: isLoadingPrice } = usePriceTier(priceTierId);

  // State điều khiển mở rộng/thu gọn danh sách chương học (Syllabus Accordion)
  // `null` biểu thị trạng thái mặc định: chỉ mở section đầu tiên.
  const [expandedSections, setExpandedSections] = React.useState<Record<
    string,
    boolean
  > | null>(null);

  // Modal xem thử bài học (Preview Lesson)
  const [previewLesson, setPreviewLesson] = React.useState<{ title: string; type: string; url: string } | null>(null);

  // Modal thanh toán/đăng ký học
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const createPayment = useCreatePayment();

  // Xác định trạng thái đã đăng ký
  const isEnrolled = course?.isEnrolled || false;

  // Format hiển thị giá tiền
  const priceDisplay = React.useMemo(() => {
    if (isLoadingPrice) return "Đang tải...";
    if (!priceTier || priceTier.priceAmount === 0) return "Miễn phí";
    return `${new Intl.NumberFormat().format(priceTier.priceAmount)}đ`;
  }, [priceTier, isLoadingPrice]);

  // Đếm tổng số bài học
  const totalLessons = React.useMemo(() => {
    if (!course?.sections) return 0;
    return course.sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);
  }, [course]);

  // Toggle thu gọn/mở rộng từng Section
  const toggleSection = (sectionId: string) => {
    setExpandedSections((previousSections) => {
      const defaultSections = course?.sections[0]
        ? { [course.sections[0].id]: true }
        : {};
      const currentSections = previousSections ?? defaultSections;

      return {
        ...currentSections,
        [sectionId]: !currentSections[sectionId],
      };
    });
  };

  // Mở bài học để học (Học thử hoặc Vào học chính thức)
  const handleOpenLesson = (lesson: CourseLesson) => {
    let url = lesson.contentReference || "";
    
    if (lesson.lessonType === "VIDEO" && lesson.contentReference) {
      let lessonId = lesson.contentReference;
      
      // Nếu contentReference là URL đầy đủ chứa /lessons/ (vd: http://localhost:9000/uniwise/lessons/2b4724db5d534f35/playlist.m3u8)
      const match = lesson.contentReference.match(/lessons\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        lessonId = match[1];
      } else {
        // Nếu không có /lessons/, giả định nó chỉ là chuỗi ID (vd: "2b4724db5d534f35")
        // Nếu vô tình có dấu '/', ta lấy phần đầu tiên không chứa đuôi file
        if (lessonId.includes('/')) {
           const parts = lessonId.split('/').filter((p: string) => p && !p.includes('.m3u8') && !p.startsWith('http'));
           if (parts.length > 0) lessonId = parts[parts.length - 1];
        }
      }

      url = `/api/proxy/media-service/api/v1/streaming/lessons/${lessonId}/playlist.m3u8`;
    }

    if (isEnrolled && course) {
      // Đã mua: chuyển hướng sang Learning Workspace
      router.push(`/course/${course.publicId}/learn?lessonId=${lesson.id}`);
      return;
    }

    if (lesson.isPreview) {
      // Chưa mua nhưng được học thử: mở modal preview
      setPreviewLesson({
        title: lesson.title,
        type: lesson.lessonType,
        url: url
      });
    } else {
      // Chưa mua và không được học thử
      toast.warning("Vui lòng mua khóa học để mở khóa bài học này.");
      setShowCheckoutModal(true);
    }
  };

  // Xác nhận đăng ký/mua khóa học qua cổng thanh toán VNPay
  const handleConfirmCheckout = async () => {
    if (!course?.id) return;
    try {
      const response = await createPayment.mutateAsync({ courseId: course.id });
      if (response && response.paymentUrl) {
        // Lưu lại id giao dịch vào localStorage để đối chiếu kết quả
        localStorage.setItem("uniwise_last_payment_id", response.id);
        // Lưu cả publicId để khi redirect về trang kết quả có thể trỏ nút CTA quay lại trang khóa học này
        localStorage.setItem("uniwise_last_course_public_id", publicId);
        // Chuyển hướng đến VNPay Sandbox
        window.location.href = response.paymentUrl;
      } else {
        toast.error("Không nhận được đường dẫn thanh toán từ hệ thống.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo liên kết thanh toán:", error);
    }
  };

  // Render trạng thái loading
  if (isLoadingCourse) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16 space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Render trạng thái lỗi/không tìm thấy khóa học
  if (isErrorCourse || !course) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16 flex flex-col items-center justify-center text-center gap-4 min-h-[60vh] animate-in fade-in">
        <AlertCircle className="w-16 h-16 text-rose-500" />
        <h1 className="text-3xl font-black text-slate-900">Không tìm thấy khóa học</h1>
        <p className="text-slate-500 font-semibold max-w-md">
          Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
        </p>
        <Link href="/courses">
          <button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md">
            <ArrowLeft className="w-5 h-5" /> Quay lại danh mục
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* ─── HERO HEADER ──────────────────────────────────────────────────────── */}
      <div className="relative pt-28 pb-16 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
        {/* Họa tiết lưới mờ ảo phía sau */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="container mx-auto px-4 relative flex flex-col gap-6">
          {/* Nút quay lại và Demo Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link 
              href="/courses" 
              className="inline-flex items-center gap-2 text-indigo-200 hover:text-white font-bold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Quay lại danh sách khóa học
            </Link>


          </div>

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

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-3xl line-clamp-3">
                {course.description || "Chưa có mô tả chi tiết cho khóa học này. Hãy đăng ký ngay để trải nghiệm lộ trình học cùng chuyên gia."}
              </p>

              {/* Thông tin metadata */}
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

              {/* Giảng viên */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-md overflow-hidden">
                  {instructor?.avatarUrl ? (
                    <img src={instructor.avatarUrl} alt={instructor.name} className="w-full h-full object-cover" />
                  ) : (
                    instructor?.name?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Giảng viên</span>
                  {instructor?.publicId ? (
                    <Link
                      href={`/u/${instructor.publicId}`}
                      className="text-white hover:text-indigo-400 transition-colors font-bold text-base hover:underline"
                    >
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

      {/* ─── MAIN CONTENT BODY ────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT & ĐỀ CƯƠNG */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Về khóa học này */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Giới thiệu khóa học
              </h2>
              <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line space-y-3">
                {course.description ? (
                  course.description
                ) : (
                  <p>
                    Chào mừng bạn đến với khóa học <strong>{course.title}</strong>. Khóa học được thiết kế bài bản với mục tiêu cung cấp cho bạn kiến thức chuyên sâu và kỹ năng thực hành vững chắc trong lĩnh vực này.
                  </p>
                )}
                <p className="mt-4">
                  <strong>Những gì bạn sẽ đạt được sau khóa học:</strong>
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {[
                    "Làm chủ kiến thức cốt lõi và các mô hình nâng cao",
                    "Thực hành thực tế thông qua các bài tập và ví dụ minh họa",
                    "Nhận được tài liệu độc quyền và hỗ trợ từ giảng viên",
                    "Tư duy giải quyết vấn đề và tối ưu hóa dự án thực tế"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Nội dung chương học (Accordion) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Nội dung chương trình học
                  </h2>
                  <p className="text-slate-500 text-sm font-semibold mt-1">
                    {course.sections?.length || 0} chương • {totalLessons} bài học
                  </p>
                </div>
                
                {/* Nút thu gọn / mở rộng nhanh */}
                <button 
                  onClick={() => {
                    const allExpanded =
                      course.sections.length > 0 &&
                      course.sections.every((section, sectionIndex) =>
                        expandedSections === null
                          ? sectionIndex === 0
                          : expandedSections[section.id] === true,
                      );
                    if (allExpanded) {
                      setExpandedSections({});
                    } else {
                      const expanded: Record<string, boolean> = {};
                      course.sections?.forEach(s => expanded[s.id] = true);
                      setExpandedSections(expanded);
                    }
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {course.sections.length > 0 &&
                  course.sections.every((section, sectionIndex) =>
                    expandedSections === null
                      ? sectionIndex === 0
                      : expandedSections[section.id] === true,
                  )
                    ? "Thu gọn tất cả"
                    : "Mở rộng tất cả"}
                </button>
              </div>

              {/* Đề cương dạng Accordion */}
              <div className="space-y-3">
                {course.sections && course.sections.length > 0 ? (
                  course.sections.map((section, sectionIndex) => {
                    const isSectionExpanded =
                      expandedSections === null
                        ? sectionIndex === 0
                        : expandedSections[section.id] === true;
                    const numLessons = section.lessons?.length || 0;
                    
                    return (
                      <div 
                        key={section.id} 
                        className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                      >
                        {/* Header của Section */}
                        <div 
                          onClick={() => toggleSection(section.id)}
                          className="flex items-center justify-between p-4 bg-slate-100/50 hover:bg-slate-100 transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                              {sectionIndex + 1}
                            </span>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base leading-tight">
                                {section.title}
                              </h3>
                              <span className="text-slate-500 text-xs font-semibold">
                                {numLessons} bài giảng
                              </span>
                            </div>
                          </div>
                          <div>
                            {isSectionExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                        </div>

                        {/* List bài giảng của Section */}
                        {isSectionExpanded && (
                          <div className="bg-white border-t border-slate-150 divide-y divide-slate-100 animate-in slide-in-from-top-1 duration-200">
                            {numLessons > 0 ? (
                              section.lessons.map((lesson, lessonIndex) => {
                                const isVideo = lesson.lessonType === "VIDEO";
                                const isCompleted = lesson.isCompleted;
                                
                                return (
                                  <div 
                                    key={lesson.id}
                                    onClick={() => handleOpenLesson(lesson)}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 min-w-0 pr-4">
                                      {/* Icon chỉ loại bài học */}
                                      {isCompleted ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                      ) : isVideo ? (
                                        <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                      )}
                                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                                        Bài {lessonIndex + 1}: {lesson.title}
                                      </span>
                                    </div>

                                    {/* Action badge/icon */}
                                    <div className="shrink-0 flex items-center gap-2">
                                      {isEnrolled ? (
                                        /* Đã sở hữu */
                                        <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                                          Học ngay
                                        </span>
                                      ) : lesson.isPreview ? (
                                        /* Chưa sở hữu nhưng là bài học thử */
                                        <Badge className="bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-100 font-bold px-2 py-0.5 text-[10px]">
                                          Học thử
                                        </Badge>
                                      ) : (
                                        /* Chưa sở hữu và bị khóa */
                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                                Chương học này chưa được cập nhật bài giảng.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">
                    Chương trình học hiện đang được cập nhật.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: STICKY PRICE CARD */}
          <div className="relative">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden flex flex-col">
              {/* Thumbnail / Gradient đại diện */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center border-b border-slate-100">
                {course.thumbnailUrl ? (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center text-slate-400 bg-linear-to-br from-indigo-50 to-purple-50">
                    <BookOpen className="w-12 h-12 text-indigo-200 mb-2" />
                    <span className="text-[12px] font-black uppercase text-indigo-300 tracking-widest">UNIWISE</span>
                  </div>
                )}

                {/* Nếu có bài học thử, hiển thị nút Play to watch preview */}
                {!isEnrolled && course.sections?.some(s => s.lessons?.some(l => l.isPreview)) && (
                  <button 
                    onClick={() => {
                      const firstPreviewLesson = course.sections
                        ?.flatMap(s => s.lessons || [])
                        ?.find(l => l.isPreview);
                      if (firstPreviewLesson) {
                        handleOpenLesson(firstPreviewLesson);
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/45 transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/95 text-indigo-600 shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-6 h-6 fill-indigo-600 translate-x-0.5" />
                    </div>
                  </button>
                )}
              </div>

              {/* Chi tiết định giá & CTA */}
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black text-slate-900">
                      {priceDisplay}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">
                    Cam kết hoàn tiền trong 7 ngày nếu không hài lòng
                  </p>
                </div>

                {isEnrolled ? (
                  /* ĐÃ MUA / ĐĂNG KÝ HỌC */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                        <span>Tiến độ học tập</span>
                        <span>{Math.round(course.progressPercentage || 0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${course.progressPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium block">
                        Đã hoàn thành {course.completedLessonsCount || 0}/{course.totalLessonsCount || totalLessons} bài học
                      </span>
                    </div>

                    <button 
                      onClick={() => {
                        // Tìm bài giảng đầu tiên để vào học
                        const firstLesson = course.sections?.flatMap(s => s.lessons || [])?.[0];
                        if (firstLesson) {
                          router.push(`/course/${course.publicId}/learn?lessonId=${firstLesson.id}`);
                        } else {
                          router.push(`/course/${course.publicId}/learn`);
                        }
                      }}
                      className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Tv className="w-5 h-5" /> Vào học ngay
                    </button>
                  </div>
                ) : (
                  /* CHƯA MUA */
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowCheckoutModal(true)}
                      className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      Đăng ký học ngay
                    </button>

                    {course.sections?.some(s => s.lessons?.some(l => l.isPreview)) && (
                      <button 
                        onClick={() => {
                          const firstPreview = course.sections
                            ?.flatMap(s => s.lessons || [])
                            ?.find(l => l.isPreview);
                          if (firstPreview) handleOpenLesson(firstPreview);
                        }}
                        className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Học thử miễn phí
                      </button>
                    )}
                  </div>
                )}

                {/* Danh sách quyền lợi */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <span className="text-xs text-slate-400 font-black uppercase tracking-wider block">
                    Khóa học bao gồm:
                  </span>
                  
                  <div className="space-y-2">
                    {[
                      { icon: BookOpen, text: "Truy cập toàn bộ tài liệu giảng dạy" },
                      { icon: Clock, text: "Sở hữu trọn đời, học mọi lúc mọi nơi" },
                      { icon: Award, text: "Chứng nhận hoàn thành khóa học UniWise" },
                      { icon: HelpCircle, text: "Hỗ trợ giải đáp thắc mắc trực tuyến 24/7" }
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-2.5 text-xs text-slate-600 font-bold">
                          <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── MODAL 1: PREVIEW LESSON ──────────────────────────────────────────── */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 text-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
              <div className="min-w-0 pr-4">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  {isEnrolled ? "Học bài giảng" : "Học thử miễn phí"}
                </span>
                <h3 className="text-base font-black truncate">{previewLesson.title}</h3>
              </div>
              <button 
                onClick={() => setPreviewLesson(null)}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Modal (Video Player hoặc Document Viewer) */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[450px]">
              {previewLesson.url ? (
                previewLesson.type === "VIDEO" ? (
                  <div className="w-full max-w-4xl mx-auto">
                    <VideoPlayer 
                      src={previewLesson.url} 
                      title={previewLesson.title || "Video bài giảng"} 
                    />
                  </div>
                ) : (
                  /* Giả lập đọc tài liệu văn bản */
                  <div className="p-8 text-slate-300 text-center max-w-lg space-y-4">
                    <FileText className="w-16 h-16 text-indigo-400 mx-auto" />
                    <h4 className="text-xl font-bold text-white">Nội dung tài liệu đính kèm</h4>
                    <p className="text-sm font-medium">
                      Đường dẫn tài liệu: <a href={previewLesson.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{previewLesson.url}</a>
                    </p>
                    <p className="text-xs text-slate-400">
                      Tài liệu đầy đủ đang được đính kèm ở định dạng PDF/Markdown. Vui lòng bấm vào liên kết để đọc hoặc tải về.
                    </p>
                  </div>
                )
              ) : (
                /* Fallback khi không có url content reference */
                <div className="p-8 text-center max-w-md space-y-4">
                  <PlayCircle className="w-16 h-16 text-indigo-500 mx-auto" />
                  <h4 className="text-xl font-black">Video bài giảng giả lập</h4>
                  <p className="text-slate-400 text-sm font-medium">
                    (Demo) Video cho bài học này hiện chưa được liên kết file vật lý trên cloud. Bạn có thể tự upload video ở dashboard giảng viên để kiểm tra tính năng đầy đủ.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-800 text-center border-t border-slate-700">
              {!isEnrolled && (
                <button 
                  onClick={() => {
                    setPreviewLesson(null);
                    setShowCheckoutModal(true);
                  }}
                  className="px-6 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 text-sm cursor-pointer inline-flex items-center gap-2"
                >
                  Đăng ký khóa học để mở khóa toàn bộ
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL 2: VNPAY CHECKOUT DIALOG ──────────────────────────────────── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="h-1.5 bg-linear-to-r from-blue-700 via-red-500 to-blue-700" />

            <div className="p-6 sm:p-7 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Xác nhận thanh toán</h3>
              <p className="text-slate-500 text-sm font-semibold">
                Bạn đang đăng ký khóa học
              </p>
              <p className="font-bold text-slate-900 text-base line-clamp-2">
                {course.title}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-semibold">Giá khóa học</span>
                <span className="font-black text-lg text-slate-900">{priceDisplay}</span>
              </div>
              <div className="flex justify-between items-center gap-4 text-sm border-t border-slate-200 pt-4">
                <span className="text-slate-500 font-semibold">Hình thức thanh toán</span>
                <div className="shrink-0 flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
                  <span className="font-black italic tracking-tight">
                    <span className="text-blue-700">VN</span>
                    <span className="text-red-500">PAY</span>
                  </span>
                  <span className="h-4 w-px bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Sandbox
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <p className="text-xs font-semibold leading-5 text-slate-600">
                Bạn sẽ được chuyển đến cổng VNPay Sandbox để hoàn tất thanh toán an toàn.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95 cursor-pointer text-sm"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmCheckout}
                disabled={createPayment.isPending}
                className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {createPayment.isPending ? "Đang chuyển hướng..." : "Thanh toán qua VNPay"}
              </button>
            </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

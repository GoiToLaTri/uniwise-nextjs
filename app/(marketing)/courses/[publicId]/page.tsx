"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-course";
import { useCreatePayment } from "@/hooks/use-payment";
import { useEnrollFreeCourse } from "@/hooks/use-learning-progress";
import { usePriceTier } from "@/hooks/use-price-tier";
import { getTokenResponse } from "@/stores/token-store";
import { formatCurrencyAmount } from "@/lib/currency";
import { type CourseLesson } from "@/interfaces/course.interface";
import { CheckoutModal } from "./_components/checkout-modal";
import { CourseDescriptionCard } from "./_components/course-description-card";
import { CourseDetailHero } from "./_components/course-detail-hero";
import { CourseEnrollmentCard } from "./_components/course-enrollment-card";
import { CourseSyllabus } from "./_components/course-syllabus";
import {
  LessonPreviewModal,
  type PreviewLesson,
} from "./_components/lesson-preview-modal";

function getLessonContentUrl(lesson: CourseLesson) {
  if (lesson.lessonType !== "VIDEO" || !lesson.contentReference) {
    return lesson.contentReference || "";
  }

  let lessonId = lesson.contentReference;
  const pathMatch = lesson.contentReference.match(/lessons\/([a-zA-Z0-9_-]+)/);

  if (pathMatch?.[1]) {
    lessonId = pathMatch[1];
  } else if (lessonId.includes("/")) {
    const pathParts = lessonId
      .split("/")
      .filter((part) => part && !part.includes(".m3u8") && !part.startsWith("http"));
    lessonId = pathParts.at(-1) || lessonId;
  }

  return `/api/proxy/media-service/api/v1/streaming/lessons/${lessonId}/playlist.m3u8`;
}

export default function CourseDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { data: course, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourse(publicId);
  const {
    data: priceTier,
    isLoading: isLoadingPrice,
    isError: isErrorPrice,
  } = usePriceTier(course?.priceTierId || "");
  const createPayment = useCreatePayment();
  const enrollFreeCourse = useEnrollFreeCourse();
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean> | null>(null);
  const [previewLesson, setPreviewLesson] = React.useState<PreviewLesson | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);

  const isEnrolled = course?.isEnrolled || false;
  const hasPriceTier = Boolean(course?.priceTierId);
  const isFreeCourse = !hasPriceTier || priceTier?.priceAmount === 0;
  const isPricePending = hasPriceTier && isLoadingPrice;
  const isPriceUnavailable =
    hasPriceTier && !isLoadingPrice && (isErrorPrice || !priceTier);
  const priceDisplay = React.useMemo(() => {
    if (!hasPriceTier) return "Miễn phí";
    if (isLoadingPrice) return "Đang tải...";
    if (isErrorPrice || !priceTier) return "Chưa xác định";
    if (priceTier.priceAmount === 0) return "Miễn phí";
    return formatCurrencyAmount(priceTier.priceAmount, priceTier.currency);
  }, [hasPriceTier, isErrorPrice, isLoadingPrice, priceTier]);
  const totalLessons = React.useMemo(
    () => course?.sections.reduce((total, section) => total + section.lessons.length, 0) ?? 0,
    [course?.sections],
  );

  const handleSectionToggle = (sectionId: string) => {
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

  const handleStartLearning = () => {
    if (!course) return;

    const firstLesson = course.sections.flatMap((section) => section.lessons)[0];
    const lessonQuery = firstLesson ? `?lessonId=${firstLesson.id}` : "";
    router.push(`/course/${course.publicId}/learn${lessonQuery}`);
  };

  const ensureAuthenticated = async () => {
    const tokenResponse = await getTokenResponse();
    if (tokenResponse) return true;

    toast.info("Vui lòng đăng nhập để đăng ký khóa học.");
    const returnPath = `/courses/${publicId}`;
    router.push(`/signin?redirect=${encodeURIComponent(returnPath)}`);
    return false;
  };

  const handleEnrollment = async () => {
    if (!course) return;
    if (isPricePending) {
      toast.info("Học phí đang được tải. Vui lòng chờ trong giây lát.");
      return;
    }
    if (isPriceUnavailable) {
      toast.error("Chưa thể xác định học phí. Vui lòng thử lại sau.");
      return;
    }
    if (!(await ensureAuthenticated())) return;

    setPreviewLesson(null);
    setShowCheckoutModal(true);
  };

  const handleOpenLesson = (lesson: CourseLesson) => {
    if (isEnrolled && course) {
      router.push(`/course/${course.publicId}/learn?lessonId=${lesson.id}`);
      return;
    }

    if (lesson.isPreview) {
      setPreviewLesson({
        title: lesson.title,
        type: lesson.lessonType,
        url: getLessonContentUrl(lesson),
      });
      return;
    }

    if (isPricePending) {
      toast.info("Học phí đang được tải. Vui lòng chờ trong giây lát.");
      return;
    }

    if (isPriceUnavailable) {
      toast.error("Chưa thể xác định học phí. Vui lòng thử lại sau.");
      return;
    }

    toast.warning(
      isFreeCourse
        ? "Hãy đăng ký miễn phí để mở khóa bài học này."
        : "Vui lòng mua khóa học để mở khóa bài học này.",
    );
    void handleEnrollment();
  };

  const handleConfirmEnrollment = async () => {
    if (!course?.id || !(await ensureAuthenticated())) return;

    if (isFreeCourse) {
      try {
        await enrollFreeCourse.mutateAsync({
          courseId: course.id,
          coursePublicId: course.publicId,
        });
        setShowCheckoutModal(false);
        handleStartLearning();
      } catch {
        // Hook đã hiển thị thông báo lỗi phù hợp.
      }
      return;
    }

    try {
      const response = await createPayment.mutateAsync({ courseId: course.id });
      if (!response?.paymentUrl) {
        toast.error("Không nhận được đường dẫn thanh toán từ hệ thống.");
        return;
      }

      localStorage.setItem("uniwise_last_payment_id", response.id);
      localStorage.setItem("uniwise_last_course_public_id", publicId);
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error("Lỗi khi tạo liên kết thanh toán:", error);
    }
  };

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
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isErrorCourse || !course) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16 flex flex-col items-center justify-center text-center gap-4 min-h-[60vh] animate-in fade-in">
        <AlertCircle className="w-16 h-16 text-rose-500" />
        <h1 className="text-3xl font-black text-slate-900">Không tìm thấy khóa học</h1>
        <p className="text-slate-500 font-semibold max-w-md">Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.</p>
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
      <CourseDetailHero course={course} totalLessons={totalLessons} />
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CourseDescriptionCard course={course} />
            <CourseSyllabus
              expandedSections={expandedSections}
              isEnrolled={isEnrolled}
              sections={course.sections}
              totalLessons={totalLessons}
              onExpandedSectionsChange={setExpandedSections}
              onLessonOpen={handleOpenLesson}
              onSectionToggle={handleSectionToggle}
            />
          </div>
          <CourseEnrollmentCard
            course={course}
            isEnrolled={isEnrolled}
            isEnrollmentPending={enrollFreeCourse.isPending || createPayment.isPending}
            isFree={isFreeCourse}
            isPricePending={isPricePending}
            isPriceUnavailable={isPriceUnavailable}
            priceDisplay={priceDisplay}
            totalLessons={totalLessons}
            onEnroll={() => void handleEnrollment()}
            onLessonOpen={handleOpenLesson}
            onStartLearning={handleStartLearning}
          />
        </div>
      </div>

      {previewLesson && (
        <LessonPreviewModal
          isEnrolled={isEnrolled}
          isEnrollmentPending={enrollFreeCourse.isPending || createPayment.isPending}
          lesson={previewLesson}
          enrollmentLabel={isFreeCourse ? "Đăng ký miễn phí để mở khóa toàn bộ" : "Mua khóa học để mở khóa toàn bộ"}
          onClose={() => setPreviewLesson(null)}
          onEnroll={() => {
            setPreviewLesson(null);
            void handleEnrollment();
          }}
        />
      )}
      {showCheckoutModal && !isPriceUnavailable && (
        <CheckoutModal
          courseTitle={course.title}
          isFree={isFreeCourse}
          isPending={enrollFreeCourse.isPending || createPayment.isPending}
          priceDisplay={priceDisplay}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={handleConfirmEnrollment}
        />
      )}
    </div>
  );
}

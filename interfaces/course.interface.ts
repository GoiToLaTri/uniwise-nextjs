import { ListResponse } from "./response/list-response.interface";

export interface InstructorSummaryResponse {
  publicId: string;
  name: string;
  avatarUrl: string | null;
}

export interface CourseLesson {
  id: string;
  publicId: string;
  sectionId: string;
  title: string;
  lessonType: string;
  contentReference: string;
  status: string;
  sortOrder: number;
  isPreview?: boolean;
  isCompleted?: boolean | null;
  lastWatchedPosition?: number | null;
}

export interface CourseSection {
  id: string;
  publicId: string;
  courseId: string;
  title: string;
  sortOrder: number;
  lessons: CourseLesson[];
}

export interface CourseResponse {
  id: string;
  publicId: string;
  instructor: InstructorSummaryResponse | null;
  priceTierId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailName?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections: CourseSection[];
  isEnrolled?: boolean;
  totalLessonsCount?: number;
  completedLessonsCount?: number;
  progressPercentage?: number;
  studentCount?: number;
  averageRating?: number;
  totalReviews?: number;
  totalLessons?: number;
  totalSections?: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailName?: string;
  priceTierId: string;
  status: string;
}

export interface UpdateCourseRequest {
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailName?: string;
  priceTierId: string;
  status: string;
}

export interface CourseListResponse extends ListResponse {
  content: CourseResponse[];
}

export interface CourseSearchResponse {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  instructor: InstructorSummaryResponse | null;
  status: string;
  thumbnailUrl: string | null;
  priceTierId: string | null;
  studentCount: number | null;
  averageRating: number | null;
  totalReviews: number | null;
  totalLessons: number | null;
  totalSections: number | null;
}

export interface CourseSearchListResponse extends ListResponse {
  content: CourseSearchResponse[];
}

export interface CreateSectionRequest {
  courseId: string;
  title: string;
  sortOrder: number;
}

export interface UpdateSectionRequest {
  title: string;
  sortOrder?: number;
}

export interface CreateLessonRequest {
  sectionId: string;
  title: string;
  lessonType: string;
  contentReference?: string;
  sortOrder: number;
}

export interface UpdateLessonRequest {
  title: string;
  lessonType: string;
  contentReference?: string;
  sortOrder?: number;
}

export interface UserCourseDto {
  courseId: string;
  publicId: string;
  title: string;
  thumbnail?: string;
  enrolledAt: string;
  isPaid: boolean;
  progressPercentage: number;
}

export interface MyCoursesResponse extends ListResponse {
  content: UserCourseDto[];
}


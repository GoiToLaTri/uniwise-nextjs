import { ListResponse } from "./response/list-response.interface";

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
  creatorId: string;
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


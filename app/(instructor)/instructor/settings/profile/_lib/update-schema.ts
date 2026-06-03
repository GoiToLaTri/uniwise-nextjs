import * as z from "zod";

const degreeUpdateSchema = z.object({
  id: z.string().optional(), // ID cũ từ database
  type: z.string().min(1, "Vui lòng chọn loại bằng cấp"),
  name: z.string().min(2, "Tên chuyên ngành quá ngắn"),
  institution: z.string().min(2, "Tên trường không được để trống"),
  issuedDate: z.string().min(1, "Vui lòng chọn ngày cấp"),
  description: z.string().max(1000).optional(),
});

const expertiseUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Tên chuyên môn không được để trống"),
  description: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

export const updateInstructorProfileSchema = z.object({
  name: z.string().min(2, "Tên giảng viên không được để trống"),
  headline: z.string().min(10, "Tiêu đề quá ngắn").max(150),
  biography: z.string().min(50, "Tiểu sử cần chi tiết hơn").max(2000),
  yearsOfExperience: z.number().min(0, "Số năm kinh nghiệm không hợp lệ").max(50, "Tối đa 50 năm"),
  degrees: z.array(degreeUpdateSchema).min(1),
  expertises: z.array(expertiseUpdateSchema).min(1),
});

export type UpdateInstructorFormValues = z.infer<typeof updateInstructorProfileSchema>;
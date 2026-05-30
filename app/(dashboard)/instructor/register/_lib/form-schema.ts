import * as z from "zod";

/**
 * Schema cho Bằng cấp (DegreeDto)
 */
export const degreeSchema = z.object({
  id: z.string().optional(), // ID có thể tự sinh ở client hoặc từ backend
  type: z.string().min(1, "Vui lòng chọn loại bằng cấp"),
  name: z.string().min(2, "Tên bằng cấp không được để trống"),
  institution: z.string().min(2, "Tên trường/tổ chức không được để trống"),
  issuedDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Ngày cấp không hợp lệ",
  }),
  description: z.string().max(500, "Mô tả bằng cấp tối đa 500 ký tự").optional(),
  credentialUrl: z
    .string()
    .url("Đường dẫn chứng chỉ không hợp lệ")
    .or(z.literal("")), // Cho phép để trống hoặc phải là URL hợp lệ
});

/**
 * Schema cho Chuyên môn (ExpertiseDto)
 */
export const expertiseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Tên lĩnh vực chuyên môn không được để trống"),
  description: z.string().max(500, "Mô tả chuyên môn tối đa 500 ký tự").optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"], "Trình độ không hợp lệ"),
});

/**
 * Schema chính cho Đăng ký Giảng viên (InstructorProfileCreateRequest)
 */
export const instructorProfileSchema = z.object({
  headline: z
    .string()
    .min(10, "Tiêu đề chuyên môn quá ngắn")
    .max(150, "HEADLINE_INVALID"),
  
  biography: z
    .string()
    .min(50, "Tiểu sử giảng viên cần chi tiết hơn (ít nhất 50 ký tự)")
    .max(2000, "BIOGRAPHY_INVALID"),

  yearsOfExperience: z.number().min(0, "Số năm kinh nghiệm không hợp lệ").max(50, "Tối đa 50 năm"),

  degrees: z
    .array(degreeSchema)
    .min(1, "Bạn cần cung cấp ít nhất một bằng cấp hoặc chứng chỉ"),

  expertises: z
    .array(expertiseSchema)
    .min(1, "Bạn cần chọn ít nhất một lĩnh vực chuyên môn"),
});

/**
 * Export Type để sử dụng trong Form component
 */
export type InstructorProfileFormValues = z.infer<typeof instructorProfileSchema>;
export type DegreeFormValues = z.infer<typeof degreeSchema>;
export type ExpertiseFormValues = z.infer<typeof expertiseSchema>;

/**
 * Giá trị khởi tạo mặc định (Default Values)
 */
export const defaultInstructorValues: Partial<InstructorProfileFormValues> = {
  headline: "",
  biography: "",
  yearsOfExperience: 0,
  degrees: [
    {
      type: "",
      name: "",
      institution: "",
      issuedDate: new Date().toISOString().split("T")[0],
      description: "",
      credentialUrl: "",
    },
  ],
  expertises: [
    {
      name: "",
      description: "",
      level: "INTERMEDIATE",
    },
  ],
};
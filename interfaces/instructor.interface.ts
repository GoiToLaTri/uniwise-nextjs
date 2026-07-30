export interface Degree {
    id?: string;
    type: string; // BACHELOR, MASTER, DOCTOR, etc.
    name: string;
    institution: string;
    issuedDate: string;
    description?: string;
    credentialUrl?: string;
  }
  
export interface Expertise {
    id?: string;
    name: string;
    description?: string;
    level?: string; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  }

  export interface PublicInstructorExpertise {
    name: string;
    description: string | null;
    level: string | null;
  }

  /** Dữ liệu gọn dùng cho từng instructor trong kết quả tìm kiếm công khai. */
  export interface PublicInstructorSearchResponse {
    publicId: string;
    name: string;
    professionalName: string | null;
    avatarUrl: string | null;
    headline: string | null;
    biography: string | null;
    yearsOfExperience: number | null;
    expertises: PublicInstructorExpertise[];
  }

  /** Bằng cấp được phép hiển thị trong hồ sơ instructor công khai. */
  export interface PublicInstructorDegree {
    type: string;
    name: string;
    institution: string | null;
    issuedDate: string | null;
    description: string | null;
  }

  /** Hồ sơ công khai đầy đủ, lấy trực tiếp từ user-service. */
  export interface PublicInstructorProfileResponse
    extends PublicInstructorSearchResponse {
    degrees: PublicInstructorDegree[];
  }

  export interface PublicInstructorListResponse {
    content: PublicInstructorSearchResponse[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  }
  
  export interface InstructorProfile {
    id: string;
    accountId: string;
    publicId: string;
    name: string;
    headline: string;
    biography: string;
    yearsOfExperience: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    reviewComment?: string;
    appliedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    degrees: Degree[];
    expertises: Expertise[];
  }
  
  export interface ApplyInstructorRequest {
    name: string;
    headline: string;
    biography: string;
    yearsOfExperience: number;
    degrees: Degree[];
    expertises: Expertise[];
  }
  
  export interface UpdateInstructorRequest {
    name: string;
    headline: string;
    biography: string;
    yearsOfExperience: number;
    degrees: Degree[];
    expertises: Expertise[];
  }
  
  export interface InstructorApplicationListResponse {
    content: InstructorProfile[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  }

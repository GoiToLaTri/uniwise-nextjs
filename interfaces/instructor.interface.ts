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
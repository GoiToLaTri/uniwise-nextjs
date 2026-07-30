import { cn } from "@/lib/utils";

export type Role = "USER" | "STUDENT" | "INSTRUCTOR" | "ADMIN";

export function RoleBadge({ role }: { role: Role | string }) {
  const variants = {
    USER: "bg-emerald-50 text-emerald-600 border-emerald-100",
    STUDENT: "bg-emerald-50 text-emerald-600 border-emerald-100",
    INSTRUCTOR: "bg-indigo-50 text-indigo-600 border-indigo-100",
    ADMIN: "bg-red-50 text-red-600 border-red-100",
  };

  const labels = {
    USER: "Học viên",
    STUDENT: "Học viên",
    INSTRUCTOR: "Giảng viên",
    ADMIN: "Quản trị viên",
  };

  // Normalize role string to uppercase for matching
  const normalizedRole = role.toUpperCase() as Role;
  
  // Fallback for unknown roles
  const variant = variants[normalizedRole] || "bg-gray-50 text-gray-600 border-gray-100";
  const label = labels[normalizedRole] || role;

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      variant
    )}>
      {label}
    </span>
  );
}

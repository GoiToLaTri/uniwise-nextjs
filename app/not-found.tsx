import { ErrorPageLayout } from "@/components/layout/error-page-layout";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <ErrorPageLayout
      statusCode="404"
      title="Không tìm thấy trang"
      message="Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc không tồn tại."
      icon={SearchX}
    />
  );
}
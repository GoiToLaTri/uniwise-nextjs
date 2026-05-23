import { ErrorPageLayout } from "@/components/layout/error-page-layout";
import { CircleSlash } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <ErrorPageLayout
      statusCode="403"
      title="Quyền truy cập bị từ chối"
      message="Bạn không có đủ quyền để xem nội dung này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là lỗi."
      icon={CircleSlash}
    />
  );
}
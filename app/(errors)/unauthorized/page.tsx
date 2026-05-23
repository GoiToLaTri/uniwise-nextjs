import { ErrorPageLayout } from "@/components/layout/error-page-layout";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <ErrorPageLayout
      statusCode="401"
      title="Không được phép truy cập"
      message="Bạn cần đăng nhập để truy cập tài nguyên này. Vui lòng đăng nhập hoặc tạo tài khoản mới."
      icon={Lock}
      buttonText="Đăng nhập ngay"
      buttonLink="/signin"
    />
  );
}
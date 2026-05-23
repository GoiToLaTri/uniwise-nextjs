import { ErrorPageLayout } from "@/components/layout/error-page-layout";
import { ServerCrash } from "lucide-react";

export default function ServerErrorPage() {
  return (
    <ErrorPageLayout
      statusCode="500"
      title="Lỗi máy chủ nội bộ"
      message="Đã có lỗi xảy ra trên máy chủ của chúng tôi. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
      icon={ServerCrash}
    />
  );
}
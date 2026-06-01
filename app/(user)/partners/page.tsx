import { PartnerHero } from "./_components/partner-hero";
import { InstructorFeature } from "./_components/instructor-feature";
import { PartnerCategory } from "./_components/partner-category";
import { Building2, Users, Share2, Lightbulb } from "lucide-react";

export default function PartnersPage() {
  return (
    <div className="pb-20">
      {/* 1. HERO SECTION */}
      <PartnerHero />

      {/* 2. CHUYÊN MỤC GIẢNG VIÊN (Nội dung chi tiết) */}
      <section id="instructors" className="py-24 bg-white">
        <InstructorFeature />
      </section>

      {/* 3. CÁC HÌNH THỨC HỢP TÁC KHÁC (Placeholders) */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Các mô hình hợp tác khác
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Uniwise mở rộng cánh cửa hợp tác với mọi tổ chức và cá nhân có cùng tầm nhìn thay đổi giáo dục.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PartnerCategory 
            icon={Building2}
            title="Doanh nghiệp (B2B)"
            description="Giải pháp đào tạo nội bộ và nâng cao kỹ năng cho đội ngũ nhân sự chuyên nghiệp."
          />
          <PartnerCategory 
            icon={Share2}
            title="Đại lý (Affiliate)"
            description="Chia sẻ khóa học và nhận hoa hồng hấp dẫn từ mạng lưới học viên rộng lớn."
          />
          <PartnerCategory 
            icon={Lightbulb}
            title="Sáng tạo nội dung"
            description="Hợp tác sản xuất học liệu số và các chương trình giáo dục thế hệ mới."
          />
        </div>
      </section>
    </div>
  );
}
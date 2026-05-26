import { HeroSection } from "./_components/hero-section";
import { CourseCard } from "./_components/course-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FEATURED_COURSES = [
  {
    title: "Fullstack Next.js 14 với Tailwind CSS v4 và Prisma",
    instructor: "Alex Nguyen",
    price: "1.299.000đ",
    rating: 4.9,
    students: 1205,
    category: "Development",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
  },
  {
    title: "UI/UX Design Masterclass: From Zero to Pro Hero",
    instructor: "Elena Tran",
    price: "890.000đ",
    rating: 4.8,
    students: 856,
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80",
  },
  {
    title: "AI & Machine Learning cơ bản cho người mới bắt đầu",
    instructor: "Dr. Minh Vu",
    price: "1.500.000đ",
    rating: 5.0,
    students: 420,
    category: "Data Science",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      <HeroSection />

      {/* Featured Courses Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-3">
              Khám phá tiềm năng
            </h2>
            <h3 className="text-4xl font-black tracking-tight">
              Khóa học tiêu biểu
            </h3>
          </div>
          <Button
            variant="link"
            className="text-indigo-600 font-bold p-0 h-auto"
          >
            Xem tất cả khóa học →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_COURSES.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>
      </section>

      {/* Trust/CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-indigo-200">
          <h2 className="text-4xl font-black mb-6 tracking-tight">
            Sẵn sàng để bắt đầu hành trình của bạn?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto font-medium">
            Tham gia cùng hơn 10.000+ học viên đã thay đổi sự nghiệp thành công
            qua các khóa học tại UniWise.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="signup">
              <Button className="bg-white text-indigo-600 hover:bg-slate-50 font-black h-12 px-8 rounded-xl active:scale-95 transition-all">
                Đăng ký ngay
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-indigo-400 text-pink-400 hover:bg-indigo-500 font-black h-12 px-8 rounded-xl active:scale-95 transition-all"
            >
              Tư vấn lộ trình
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

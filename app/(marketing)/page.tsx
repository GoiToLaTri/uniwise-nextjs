"use client";

import { HeroSection } from "./_components/hero-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
          <Link href="/courses">
            <Button
              variant="link"
              className="text-indigo-600 font-bold p-0 h-auto cursor-pointer"
            >
              Xem tất cả khóa học →
            </Button>
          </Link>
        </div>

        <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 border-dashed shadow-xs">
          <p className="text-slate-500 font-bold italic">
            Danh sách khóa học tiêu biểu đang được cập nhật. Vui lòng quay lại sau!
          </p>
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

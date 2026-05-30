"use client";

import { useState } from "react";
import { StepProgress } from "./step-progress";
import { BasicInfoForm, type StepOneValues } from "./basic-info-form";
import { DegreesForm } from "./degrees-form";
import { ExpertiseForm } from "./expertise-form";
import { InstructorProfileFormValues } from "../_lib/form-schema";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, GraduationCap, Home, Loader2, Mail, PartyPopper, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function InstructorProfileForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter()

  // State tổng quản lý toàn bộ dữ liệu form
  const [formData, setFormData] = useState<Partial<InstructorProfileFormValues>>({
    headline: "",
    biography: "",
    yearsOfExperience: 0,
    degrees: [{ type: "", name: "", institution: "", issuedDate: "", description: "", credentialUrl: "" }],
    expertises: [{ name: "", description: "", level: "BEGINNER" }]
  });

  // Xử lý Giai đoạn 1
  const handleStepOneNext = (data: StepOneValues) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Xử lý Giai đoạn 2
  const handleStepTwoNext = (data: Pick<InstructorProfileFormValues, "degrees">) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // XỬ LÝ SUBMIT CUỐI CÙNG
  const handleFinalSubmit = async (expertiseData: Pick<InstructorProfileFormValues, "expertises">) => {
    setIsLoading(true);
    
    // Gom tất cả dữ liệu lại lần cuối
    const finalPayload = { ...formData, ...expertiseData };
    
    // Giả lập gọi API (Delay 2s)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log(">>> FINAL DATA SUBMITTED TO BACKEND:", finalPayload);
    
    setFormData(finalPayload); // Lưu bản đầy đủ để hiển thị ở màn success
    setIsLoading(false);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // MÀN HÌNH THÀNH CÔNG (SUCCESS VIEW)
  if (isSuccess) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center py-10">
        {/* 1. Icon Thành công với hiệu ứng Pulse */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-24 h-24 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-white stroke-[2.5]" />
          </div>
        </div>

        {/* 2. Tiêu đề & Mô tả */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Gửi hồ sơ thành công!
          </h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            Cảm ơn bạn đã tin tưởng Uniwise. Hồ sơ chuyên gia của bạn đã được chuyển đến bộ phận kiểm duyệt.
          </p>
        </div>

        {/* 3. Tóm tắt hồ sơ (Profile Summary Card) */}
        <div className="w-full bg-slate-50/50 border border-slate-200 rounded-[2rem] p-8 mb-10 space-y-6 relative overflow-hidden group">
            <div className="flex items-center gap-4 border-b border-slate-200/60 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề chuyên môn</p>
                    <h4 className="text-lg font-bold text-slate-800 line-clamp-1">{formData.headline}</h4>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="text-left space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kinh nghiệm</p>
                    <p className="text-sm font-bold text-slate-700">{formData.yearsOfExperience} năm làm việc</p>
                </div>
                <div className="text-left space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hồ sơ đã nộp</p>
                    <p className="text-sm font-bold text-slate-700">
                        {formData.degrees?.length} Bằng cấp • {formData.expertises?.length} Chuyên môn
                    </p>
                </div>
            </div>
        </div>

        {/* 4. Timeline các bước tiếp theo */}
        <div className="w-full space-y-6 mb-12">
            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Quy trình tiếp theo</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: Clock, label: "Xét duyệt", desc: "Trong 3-5 ngày" },
                    { icon: Mail, label: "Phản hồi", desc: "Qua email cá nhân" },
                    { icon: ArrowRight, label: "Bắt đầu", desc: "Tạo khóa học đầu tiên" },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <item.icon className="w-5 h-5 text-indigo-500 mb-2" />
                        <span className="text-[11px] font-black uppercase text-slate-700">{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* 5. Nút điều hướng */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
                onClick={() => router.replace("/")}
                className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
                <Home className="w-4 h-4" /> Về trang chủ
            </Button>
            <Button 
                variant="outline"
                className="flex-1 h-12 rounded-xl border-slate-200 font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
            >
                Trung tâm hỗ trợ
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* 1. Thanh tiến trình */}
      <StepProgress currentStep={currentStep} />

      {/* 2. Hiệu ứng Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-[2rem] animate-in fade-in duration-300">
          <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="font-black text-xs uppercase tracking-widest text-slate-700">Đang xử lý dữ liệu...</span>
          </div>
        </div>
      )}

      {/* 3. Nội dung Form theo bước */}
      <div className={cn("transition-all duration-500", isLoading && "opacity-20 pointer-events-none blur-[1px]")}>
        {currentStep === 1 && (
          <BasicInfoForm 
            onNext={handleStepOneNext} 
            initialData={{
              headline: formData.headline!,
              biography: formData.biography!,
              yearsOfExperience: formData.yearsOfExperience!
            }}
          />
        )}

        {currentStep === 2 && (
          <DegreesForm 
            onNext={handleStepTwoNext} 
            onBack={handleBack}
            initialData={{ degrees: formData.degrees! }}
          />
        )}

        {currentStep === 3 && (
          <ExpertiseForm 
            onSubmit={handleFinalSubmit} 
            onBack={handleBack}
            initialData={{ expertises: formData.expertises! }}
          />
        )}
      </div>
    </div>
  );
}
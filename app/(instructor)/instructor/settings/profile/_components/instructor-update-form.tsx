"use client";

import * as React from "react";
import { BasicInfoUpdateForm } from "./basic-info-update-form";
import { DegreesUpdateForm } from "./degrees-update-form";
import { UpdateInstructorFormValues } from "../_lib/update-schema";
import { StepProgress } from "@/app/(dashboard)/instructor/register/_components/step-progress";
import { ExpertiseUpdateForm } from "./expertise-update-form";
import { useRouter } from "next/navigation";
import { useUpdateInstructorProfile } from "@/hooks/use-instructor";

interface InstructorUpdateFormProps {
  initialData: UpdateInstructorFormValues;
}

export function InstructorUpdateForm({ initialData }: InstructorUpdateFormProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<UpdateInstructorFormValues>(initialData);
  const router = useRouter();
  
  // Sử dụng hook update profile
  const updateProfileMutation = useUpdateInstructorProfile();

  // Xử lý Giai đoạn 1 hoàn tất
  const handleStepOneNext = (
    data: Pick<UpdateInstructorFormValues, "name" | "headline" | "biography" | "yearsOfExperience">,
  ) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Xử lý Giai đoạn 2 hoàn tất
  const handleStepTwoNext = (data: Pick<UpdateInstructorFormValues, "degrees">) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async (
    expertiseData: Pick<UpdateInstructorFormValues, "expertises">,
  ) => {
    const finalPayload = { ...formData, ...expertiseData };
    
    try {
    //   console.log(">>> GỬI HỒ SƠ CẬP NHẬT:", finalPayload);
      
      // Gọi API Update bằng mutation
      await updateProfileMutation.mutateAsync(finalPayload);
      
      // Chuyển hướng sau khi thành công
      router.replace("/");
      
    } catch (e) {
      // Error đã được xử lý trong hook (toast.error)
      console.error("Update failed:", e);
    }
  };

  return (
    <div className="w-full space-y-12">
      {/* 1. THANH TIẾN TRÌNH */}
      <StepProgress currentStep={currentStep} />

      <div className="relative">
        
        {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
        {currentStep === 1 && (
          <BasicInfoUpdateForm 
            onNext={handleStepOneNext}
            initialData={{
              name: formData.name,
              headline: formData.headline,
              biography: formData.biography,
              yearsOfExperience: formData.yearsOfExperience
            }}
          />
        )}

        {/* BƯỚC 2: BẰNG CẤP */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <DegreesUpdateForm 
              onBack={handleBack} 
              onNext={handleStepTwoNext}
              initialData={{ degrees: formData.degrees }}
            />
          </div>
        )}

        {/* BƯỚC 3: CHUYÊN MÔN */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full">
            <ExpertiseUpdateForm 
              onBack={handleBack} 
              onSubmit={handleFinalSubmit}
              initialData={{ expertises: formData.expertises }}
              isSubmitting={updateProfileMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}

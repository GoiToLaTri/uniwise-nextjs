"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
}

const steps = ["Thông tin chung", "Bằng cấp", "Chuyên môn"];

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > idx + 1;
        const isActive = currentStep === idx + 1;

        return (
          <div key={idx} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isActive && "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]",
                  isCompleted && "border-indigo-600 bg-indigo-600 text-white",
                  !isActive && !isCompleted && "border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <span className="font-bold text-sm">{idx + 1}</span>}
              </div>
              <span className={cn(
                "text-[10px] uppercase font-black tracking-widest",
                isActive ? "text-indigo-600" : "text-slate-400"
              )}>
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="h-[2px] flex-1 mx-4 bg-slate-100 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-indigo-600 transition-all duration-700 ease-in-out" 
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
"use client";

import { PublicInstructorProfileResponse } from "@/interfaces/instructor.interface";
import { Award, Briefcase, GraduationCap, Sparkles } from "lucide-react";

interface InstructorBioProps {
  profile: PublicInstructorProfileResponse;
}

function formatIssuedDate(issuedDate: string | null) {
  if (!issuedDate) return null;

  const date = new Date(`${issuedDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return issuedDate;

  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function InstructorBio({ profile }: InstructorBioProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Cột trái: Thông tin tổng quan */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Kinh nghiệm giảng dạy
          </h3>
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-semibold">Thâm niên trong ngành</p>
            <p className="text-2xl font-black text-slate-900">
              {profile.yearsOfExperience} <span className="text-sm font-bold text-slate-500">năm</span>
            </p>
          </div>
          {profile.headline && (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <p className="text-slate-500 text-sm font-semibold">Châm ngôn / Lĩnh vực chính</p>
              <p className="text-slate-700 text-sm font-bold leading-relaxed">
                “{profile.headline}”
              </p>
            </div>
          )}
        </div>

        {/* Chuyên môn */}
        {profile.expertises && profile.expertises.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Lĩnh vực chuyên môn
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.expertises.map((exp, idx) => (
                <div key={idx} className="group/item relative">
                  <span className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:border-indigo-500 transition-colors">
                    {exp.name} {exp.level && <span className="text-indigo-600">({exp.level})</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cột phải: Tiểu sử chi tiết */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tiểu sử */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Giới thiệu bản thân</h3>
          <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-line text-base">
            {profile.biography || "Giảng viên chưa cập nhật tiểu sử chi tiết."}
          </p>
        </div>

        {/* Bằng cấp công khai */}
        {profile.degrees.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
              Học vị & Bằng cấp
            </h3>

            <div className="relative ml-3 space-y-8 border-l-2 border-slate-100 pl-8">
              {profile.degrees.map((degree, index) => {
                const formattedIssuedDate = formatIssuedDate(degree.issuedDate);
                const degreeKey = [
                  degree.type,
                  degree.name,
                  degree.institution,
                  degree.issuedDate,
                ].join("-");

                return (
                  <div
                    key={`${degreeKey}-${index}`}
                    className="relative space-y-2"
                  >
                    <div className="absolute -left-[45px] top-0 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-indigo-600">
                      <Award className="h-4 w-4" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900">{degree.name}</h4>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700">
                        {degree.type}
                      </span>
                    </div>

                    {(degree.institution || formattedIssuedDate) && (
                      <p className="text-sm font-semibold text-slate-600">
                        {degree.institution}
                        {degree.institution && formattedIssuedDate && " • "}
                        {formattedIssuedDate && (
                        <span className="text-slate-400">
                          Cấp {formattedIssuedDate}
                        </span>
                      )}
                      </p>
                    )}

                    {degree.description && (
                      <p className="text-sm font-medium leading-relaxed text-slate-500">
                        {degree.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

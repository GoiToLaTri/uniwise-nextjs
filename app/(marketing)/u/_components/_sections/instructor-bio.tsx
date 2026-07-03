"use client";

import * as React from "react";
import { InstructorProfile } from "@/interfaces/instructor.interface";
import { Award, Briefcase, GraduationCap, Sparkles } from "lucide-react";

interface InstructorBioProps {
  profile: InstructorProfile;
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
                "{profile.headline}"
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

      {/* Cột phải: Tiểu sử chi tiết & Bằng cấp */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tiểu sử */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Giới thiệu bản thân</h3>
          <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-line text-base">
            {profile.biography || "Giảng viên chưa cập nhật tiểu sử chi tiết."}
          </p>
        </div>

        {/* Bằng cấp & Chứng chỉ */}
        {profile.degrees && profile.degrees.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              Học vị & Bằng cấp
            </h3>
            <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-8">
              {profile.degrees.map((deg, idx) => (
                <div key={idx} className="relative">
                  {/* Icon Node */}
                  <div className="absolute -left-[35px] top-1 bg-white p-1 rounded-full border border-slate-200 text-slate-500 shadow-xs">
                    <Award className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h4 className="text-lg font-bold text-slate-900 leading-snug">
                        {deg.name}
                      </h4>
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-50 text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                        {deg.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold">
                      {deg.institution} {deg.issuedDate && <span>• Nhận năm {deg.issuedDate}</span>}
                    </p>
                    {deg.description && (
                      <p className="text-slate-600 text-sm font-medium leading-relaxed mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {deg.description}
                      </p>
                    )}
                    {deg.credentialUrl && (
                      <a 
                        href={deg.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline pt-1"
                      >
                        Xem chứng chỉ trực tuyến →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { notFound, useParams } from "next/navigation";
import { ProfileHeader } from "../_components/profile-header";
import { ProfileHeaderSkeleton } from "../_components/profile-header-skeleton";
import { ProfileTabs } from "../_components/profile-tabs";
import { usePublicProfile } from "@/hooks/use-profile";

export default function PublicProfilePage() {
  console.log("PublicProfilePage render");
  const { publicId } = useParams<{publicId: string}>();
  const { data: user, isLoading, error } = usePublicProfile(publicId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="h-64 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-blue-600 md:h-80" />
        <div className="container mx-auto px-4">
          <div className="relative -mt-32 space-y-8">
            <ProfileHeaderSkeleton />
          </div>
        </div>
      </div>
    );
  }

   // Xử lý lỗi hoặc không tìm thấy user
  if (error || !user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. Phần Hero Background (Màu xanh/tím) */}
      <div className="h-64 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-blue-600 md:h-80" />

      {/* 2. Phần nội dung chính bọc trong Container */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-32 space-y-8">
          {/* Header Card Trắng */}
          <ProfileHeader user={user} />
          <div>
            <ProfileTabs roles={["ADMIN"]}/>
          </div>
        </div>
      </div>
    </div>
  );
}
import { BrandIcons } from "@/components/icons/brand-icons";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "./role-badge";
import { UserAvatar } from "./user-avatar";
import { PublicProfileResponse } from "@/interfaces/response";
import { PublicInstructorSearchResponse } from "@/interfaces/instructor.interface";

interface ProfileHeaderProps {
  user: PublicProfileResponse;
  instructor?: PublicInstructorSearchResponse | null;
}

export function ProfileHeader({ user, instructor }: ProfileHeaderProps) {
  const displayName =
    instructor?.professionalName || instructor?.name || user.name;
  const avatarUrl = instructor?.avatarUrl || user.avatarUrl;
  const description =
    instructor?.headline || user.bio || instructor?.biography;

  return (
    <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] md:p-10">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        {/* Avatar giữ nguyên tỷ lệ vuông */}
        <UserAvatar src={avatarUrl || ""} name={displayName} />

        <div className="flex-1 space-y-5 self-center">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 md:text-5xl">
              {displayName}
            </h1>
            <div className="flex gap-2">
              <RoleBadge role={user.profileType} />
            </div>
          </div>

          <p className="max-w-2xl text-lg font-medium text-slate-500">
            {description || "Chưa có thông tin giới thiệu"}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-slate-200 font-bold"
            >
              <BrandIcons.Github className="mr-2 h-5 w-5" /> Github
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-slate-200 font-bold"
            >
              <BrandIcons.Linkedin className="mr-2 h-5 w-5 text-blue-600" />{" "}
              LinkedIn
            </Button>
            <Button className="h-11 rounded-xl bg-indigo-600 px-8 font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700">
              Theo dõi ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

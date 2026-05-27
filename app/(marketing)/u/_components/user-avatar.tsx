"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function UserAvatar({ src, name, size = "xl" }: any) {
  const initials = name?.charAt(0).toUpperCase() || "U";

  return (
    // shrink-0 để không bị bóp méo, aspect-square để luôn là hình vuông
    <div className={cn(
      "relative shrink-0 aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-xl",
      "w-32 md:w-40 lg:w-48" // Cố định kích thước theo breakpoint
    )}>
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-600 via-purple-500 to-blue-500 p-4">
          {/* Vòng tròn trắng chứa chữ cái bên trong */}
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-inner border border-white/40">
            <span className="text-4xl md:text-6xl font-black tracking-tighter text-indigo-600">
              {initials}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
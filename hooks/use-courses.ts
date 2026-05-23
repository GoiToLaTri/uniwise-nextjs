"use client";

import { useQuery } from "@tanstack/react-query";

// Giả lập API call
async function fetchFeaturedCourses() {
  const response = await fetch("/api/courses/featured");
  if (!response.ok) throw new Error("Không thể tải danh sách khóa học");
  return response.json();
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: ["courses", "featured"],
    queryFn: fetchFeaturedCourses,
  });
}

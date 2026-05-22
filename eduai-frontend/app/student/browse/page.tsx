"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { CourseCard } from "@/components/courses/course-card";
import { api, getErrorMessage } from "@/lib/api";

export default function StudentBrowseCoursesPage() {
  const qc = useQueryClient();

  const courses = useQuery({
    queryKey: ["courses", "public"],
    queryFn: () => api.courses.publicList(),
  });

  useEffect(() => {
    if (courses.isError) toast.error(getErrorMessage(courses.error));
  }, [courses.error, courses.isError]);

  const enroll = useMutation({
    mutationFn: (courseId: string) => api.enrollments.enroll(courseId),
    onSuccess: async () => {
      toast.success("Enrolled successfully");
      await qc.invalidateQueries({ queryKey: ["student", "dashboard"] });
      await qc.invalidateQueries({ queryKey: ["student", "my-courses"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (courses.isLoading) return <LoadingState label="Loading courses..." />;
  if (courses.isError) return <EmptyState title="Failed to load courses" description="Please try again." />;

  const data = courses.data ?? [];

  return (
    <div>
      <PageHeader title="Browse courses" description="Explore available courses." />

      {data.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              showEnroll
              enrolling={enroll.isPending}
              onEnroll={(courseId) => {
                if (c.price > 0) {
                  toast.error("Only free course enrollment is supported here");
                  return;
                }
                enroll.mutate(courseId);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No courses found" />
      )}
    </div>
  );
}

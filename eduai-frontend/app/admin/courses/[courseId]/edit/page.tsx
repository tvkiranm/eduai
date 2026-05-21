"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { LoadingState, EmptyState } from "@/components/layout/states";
import { CourseForm, type CourseFormValues } from "@/components/courses/course-form";
import { api, getErrorMessage } from "@/lib/api";

export default function AdminEditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const course = useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => api.courses.get(courseId),
  });

  useEffect(() => {
    if (course.isError) toast.error(getErrorMessage(course.error));
  }, [course.error, course.isError]);

  if (course.isLoading) return <LoadingState label="Loading course..." />;
  if (course.isError) return <EmptyState title="Failed to load course" description="Please try again." />;

  async function handleSubmit(values: CourseFormValues) {
    try {
      await api.courses.update(courseId, values);
      toast.success("Course updated");
      router.replace(`/admin/courses`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Edit course" description="Update course details (Admin)." />
      <CourseForm mode="edit" initial={course.data} onSubmit={handleSubmit} showAdminNote />
    </div>
  );
}

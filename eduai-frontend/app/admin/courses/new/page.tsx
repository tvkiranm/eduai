"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { CourseForm, type CourseFormValues } from "@/components/courses/course-form";
import { api, getErrorMessage } from "@/lib/api";

export default function AdminCreateCoursePage() {
  const router = useRouter();

  async function handleSubmit(values: CourseFormValues) {
    try {
      const created = await api.courses.create(values);
      toast.success("Course created");
      router.replace(`/admin/courses/${created.id}/edit`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Create course" description="Create a new course (Admin)." />
      <CourseForm mode="create" onSubmit={handleSubmit} showAdminNote />
    </div>
  );
}


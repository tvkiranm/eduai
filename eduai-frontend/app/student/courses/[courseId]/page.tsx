"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";

export default function StudentCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const detail = useQuery({
    queryKey: ["student", "course", courseId],
    queryFn: () => api.student.courseDetail(courseId),
  });

  useEffect(() => {
    if (detail.isError) toast.error(getErrorMessage(detail.error));
  }, [detail.error, detail.isError]);

  if (detail.isLoading) return <LoadingState label="Loading course..." />;
  if (detail.isError) return <EmptyState title="Failed to load course" description="Please try again." />;

  const payload = detail.data?.data;
  if (!payload) return <EmptyState title="No course data" />;
  const { enrollment, course } = payload;

  return (
    <div>
      <PageHeader
        title={course.title}
        description={course.description}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Course info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/65">
            <div>
              <span className="font-medium text-zinc-50">Category:</span>{" "}
              {course.category?.name ?? "-"}
            </div>
            <div>
              <span className="font-medium text-zinc-50">Teacher:</span>{" "}
              {course.teacher?.fullName ?? "-"}
            </div>
            <div>
              <span className="font-medium text-zinc-50">Level:</span> {course.level}
            </div>
            <div>
              <span className="font-medium text-zinc-50">Status:</span>{" "}
              <span className="capitalize">{course.status}</span>
            </div>
            <div>
              <span className="font-medium text-zinc-50">Enrolled at:</span>{" "}
              {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleString() : "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thumbnail</CardTitle>
          </CardHeader>
          <CardContent>
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="aspect-video w-full rounded-lg border border-white/10 object-cover"
              />
            ) : (
              <div className="eduai-glass rounded-lg border-dashed p-6 text-sm text-white/65">
                No thumbnail
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

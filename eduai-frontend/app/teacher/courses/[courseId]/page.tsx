"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";

export default function TeacherCourseDetailsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const course = useQuery({
    queryKey: ["teacher", "course", courseId],
    queryFn: () => api.teacher.courseDetails(courseId),
  });

  useEffect(() => {
    if (course.isError) toast.error(getErrorMessage(course.error));
  }, [course.error, course.isError]);

  if (course.isLoading) return <LoadingState label="Loading course..." />;
  if (course.isError) return <EmptyState title="Failed to load course" description="Please try again." />;

  const data = course.data?.data;
  if (!data) return <EmptyState title="No course data" />;

  return (
    <div>
      <PageHeader
        title={data.title}
        description={data.description}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/teacher/courses/${courseId}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/teacher/courses/${courseId}/students`}>Students</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/teacher/courses/${courseId}/stats`}>Stats</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/65">
            <div>
              <span className="font-medium text-zinc-50">Slug:</span> {data.slug}
            </div>
            <div>
              <span className="font-medium text-zinc-50">Status:</span>{" "}
              <span className="capitalize">{data.status}</span>
            </div>
            <div>
              <span className="font-medium text-zinc-50">Price:</span> {data.price}
            </div>
            <div>
              <span className="font-medium text-zinc-50">Level:</span> {data.level}
            </div>
            <div>
              <span className="font-medium text-zinc-50">Category:</span>{" "}
              {data.category?.name ?? "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thumbnail</CardTitle>
          </CardHeader>
          <CardContent>
            {data.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.thumbnailUrl}
                alt={data.title}
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

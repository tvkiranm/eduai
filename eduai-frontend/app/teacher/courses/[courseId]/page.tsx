"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
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

  const seedTwoSum = useMutation({
    mutationFn: () => api.teacher.seedTwoSumInteractive(courseId),
    onSuccess: (res) => {
      toast.success(res.message || "Seeded interactive lesson");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
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
          <CardContent className="space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Slug:</span> {data.slug}
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Status:</span>{" "}
              <span className="capitalize">{data.status}</span>
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Price:</span> {data.price}
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Level:</span> {data.level}
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Category:</span>{" "}
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
                className="aspect-video w-full rounded-lg border border-[color:var(--color-border)] object-cover"
              />
            ) : (
              <div className="eduai-glass rounded-lg border-dashed p-6 text-sm text-[color:var(--color-muted-foreground)]">
                No thumbnail
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Interactive lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[color:var(--color-muted-foreground)]">
            <div>
              Seed a ready-to-use interactive lesson inside this course: <span className="font-medium text-[color:var(--color-foreground)]">Two Sum</span>.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => seedTwoSum.mutate()}
                disabled={seedTwoSum.isPending}
              >
                {seedTwoSum.isPending ? "Adding..." : "Add Two Sum interactive lesson"}
              </Button>
              <Button asChild variant="outline">
                <Link href={`/teacher/courses/${courseId}/stats`}>View course stats</Link>
              </Button>
            </div>
            {seedTwoSum.data?.data?.lessonId ? (
              <div className="text-xs break-all">
                Lesson created: {seedTwoSum.data.data.lessonId}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

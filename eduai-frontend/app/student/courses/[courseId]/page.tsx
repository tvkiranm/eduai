"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";

export default function StudentCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const detail = useQuery({
    queryKey: ["student", "course", courseId],
    queryFn: () => api.student.courseDetail(courseId),
  });

  const curriculum = useQuery({
    queryKey: ["student", "course", courseId, "curriculum"],
    queryFn: () => api.student.courseCurriculum(courseId),
  });

  useEffect(() => {
    if (detail.isError) toast.error(getErrorMessage(detail.error));
  }, [detail.error, detail.isError]);

  useEffect(() => {
    if (curriculum.isError) toast.error(getErrorMessage(curriculum.error));
  }, [curriculum.error, curriculum.isError]);

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
          <CardContent className="space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Category:</span>{" "}
              {course.category?.name ?? "-"}
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Teacher:</span>{" "}
              {course.teacher?.fullName ?? "-"}
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Level:</span> {course.level}
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Status:</span>{" "}
              <span className="capitalize">{course.status}</span>
            </div>
            <div>
              <span className="font-medium text-[color:var(--color-foreground)]">Enrolled at:</span>{" "}
              {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleString() : "-"}
            </div>
          </CardContent>
        </Card>

        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle className="text-base">Thumbnail</CardTitle>
          </CardHeader>
          <CardContent>
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnailUrl}
                alt={course.title}
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
            <CardTitle className="text-base">Modules & lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {curriculum.isLoading ? (
              <LoadingState label="Loading curriculum..." />
            ) : curriculum.data?.data?.length ? (
              <div className="space-y-4">
                {curriculum.data.data.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-[color:var(--color-foreground)]">{m.title}</div>
                        {m.description ? (
                          <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{m.description}</div>
                        ) : null}
                      </div>
                      <Badge variant="secondary">{m.lessons.length} lessons</Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {m.lessons.map((l) => (
                        <div
                          key={l.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate font-medium">{l.title}</div>
                              <Badge variant={l.lessonType === "interactive" ? "default" : "outline"}>
                                {l.lessonType}
                              </Badge>
                              <Badge variant="secondary">{l.xpReward} XP</Badge>
                            </div>
                            {l.description ? (
                              <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                                {l.description}
                              </div>
                            ) : null}
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/student/courses/${courseId}/lessons/${l.id}`}>Start</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No lessons yet"
                description="This course doesn't have modules/lessons configured yet."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

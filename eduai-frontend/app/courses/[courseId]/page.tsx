"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function PublicCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const { isAuthenticated } = useAuth();

  const course = useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => api.courses.get(courseId),
  });

  useEffect(() => {
    if (course.isError) toast.error(getErrorMessage(course.error));
  }, [course.error, course.isError]);

  const enroll = useMutation({
    mutationFn: () => api.enrollments.enroll(courseId),
    onSuccess: () => toast.success("Enrolled successfully"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {course.isLoading ? <LoadingState label="Loading course..." /> : null}
        {course.isError ? (
          <EmptyState title="Failed to load course" description="Please try again." />
        ) : null}
        {course.data ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{course.data.title}</CardTitle>
                <div className="text-sm text-[color:var(--color-muted-foreground)]">
                  Level: {course.data.level} • Price: {course.data.price} • Status:{" "}
                  <span className="capitalize">{course.data.status}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[color:var(--color-muted-foreground)]">{course.data.description}</p>
                <div className="flex flex-wrap gap-2">
                  {isAuthenticated ? (
                    <Button
                      onClick={() => {
                        if (course.data.price > 0) {
                          toast.error("Only free course enrollment is supported here");
                          return;
                        }
                        enroll.mutate();
                      }}
                      disabled={enroll.isPending}
                    >
                      {enroll.isPending ? "Enrolling..." : "Enroll (Free)"}
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href={`/auth/sign-in?next=${encodeURIComponent(`/courses/${courseId}`)}`}>
                        Sign in to enroll
                      </Link>
                    </Button>
                  )}

                  <Button variant="outline" asChild>
                    <Link href="/">Back to home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                {course.data.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.data.thumbnailUrl}
                    alt={course.data.title}
                    className="aspect-video w-full rounded-lg border border-[color:var(--color-border)] object-cover"
                  />
                ) : (
                  <div className="eduai-glass rounded-lg border-dashed p-6 text-sm text-[color:var(--color-muted-foreground)]">
                    No thumbnail
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
      <SiteFooter />
    </div>
  );
}

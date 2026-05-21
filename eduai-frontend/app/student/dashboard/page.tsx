"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";

export default function StudentDashboardPage() {
  const dashboard = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: () => api.student.dashboard(),
  });

  useEffect(() => {
    if (dashboard.isError) toast.error(getErrorMessage(dashboard.error));
  }, [dashboard.error, dashboard.isError]);

  if (dashboard.isLoading) return <LoadingState label="Loading student dashboard..." />;
  if (dashboard.isError) return <EmptyState title="Failed to load dashboard" description="Please try again." />;

  const data = dashboard.data?.data;
  if (!data) return <EmptyState title="No dashboard data" />;

  return (
    <div>
      <PageHeader
        title="Student dashboard"
        description="Your learning overview."
        actions={
          <Button asChild variant="outline">
            <Link href="/student/browse">Browse courses</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/65">Enrolled courses</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.totalEnrolledCourses}</CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent enrollments</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/student/my-courses">My courses</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentCourses.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {data.recentCourses.map((en) => (
                  <Link
                    key={en.id}
                    href={`/student/courses/${en.courseId}`}
                    className="eduai-glass rounded-xl p-4 hover:bg-white/8"
                  >
                    <div className="font-semibold">{en.course?.title ?? "Course"}</div>
                    <div className="mt-1 text-sm text-white/65">
                      {en.course?.category?.name ?? "—"} • {en.course?.level ?? "—"}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No enrollments yet"
                description="Browse courses and enroll in a free course to get started."
                action={
                  <Button asChild>
                    <Link href="/student/browse">Browse courses</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

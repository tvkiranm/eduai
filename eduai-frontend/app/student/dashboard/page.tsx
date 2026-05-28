"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { api, getErrorMessage } from "@/lib/api";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const dashboard = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: () => api.student.dashboard(),
  });

  useEffect(() => {
    if (dashboard.isError) toast.error(getErrorMessage(dashboard.error));
  }, [dashboard.error, dashboard.isError]);

  if (dashboard.isLoading)
    return <LoadingState label="Loading student dashboard..." />;
  if (dashboard.isError)
    return (
      <EmptyState
        title="Failed to load dashboard"
        description="Please try again."
      />
    );

  const data = dashboard.data?.data;
  if (!data) return <EmptyState title="No dashboard data" />;

  const displayName =
    user?.fullName?.split(" ")[0] || user?.fullName || "Learner";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const streakDays = Math.max(1, (data.totalEnrolledCourses || 0) * 3);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                {greeting}, {displayName}!{" "}
                <span className="inline-block align-middle">👋</span>
              </div>
              <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                Let&apos;s keep learning and achieve your goals.
              </div>
            </div>

            <Card className="w-full md:w-[220px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[color:var(--color-muted-foreground)]">
                  Current streak
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-xl font-semibold">{streakDays} Days</div>
                <div className="rounded-xl bg-[color:var(--color-muted)] px-2 py-1 text-xs text-[color:var(--color-muted-foreground)]">
                  Keep it up
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Continue learning</CardTitle>
                <CardDescription>
                  Jump back into your most recent course.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/student/my-courses">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentCourses.length ? (
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[color:var(--color-foreground)]">
                      {data.recentCourses[0]?.course?.title ?? "Course"}
                    </div>
                    <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                      {data.recentCourses[0]?.course?.category?.name ?? "—"} •{" "}
                      {data.recentCourses[0]?.course?.level ?? "—"}
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-black/5">
                      <div className="h-2 w-[45%] rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
                    </div>
                    <div className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
                      45% complete
                    </div>
                  </div>
                  <Button asChild className="md:shrink-0">
                    <Link
                      href={`/student/courses/${data.recentCourses[0].courseId}`}
                    >
                      Continue
                    </Link>
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="No enrollments yet"
                  description="Browse courses and enroll in a free course to get started."
                  action={
                    <Button asChild>
                      <Link href="/student/browse">Explore courses</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">My courses</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/student/browse">Explore courses</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentCourses.length ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {data.recentCourses.slice(0, 4).map((en) => (
                    <Link
                      key={en.id}
                      href={`/student/courses/${en.courseId}`}
                      className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4 shadow-sm transition-shadow hover:eduai-glow"
                    >
                      <div className="font-semibold text-[color:var(--color-foreground)]">
                        {en.course?.title ?? "Course"}
                      </div>
                      <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                        {en.course?.category?.name ?? "—"} •{" "}
                        {en.course?.level ?? "—"}
                      </div>
                      <div className="mt-4 h-2 w-full rounded-full bg-black/5">
                        <div className="h-2 w-[60%] rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No courses yet"
                  description="Enroll in a course to see it here."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your progress</CardTitle>
              <CardDescription>Overall learning progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div
                  className="grid h-20 w-20 place-items-center rounded-full bg-[conic-gradient(from_90deg,_#4f46e5_0_68%,_rgba(15,23,42,0.08)_68%_100%)]"
                  aria-hidden="true"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-card)]">
                    <div className="text-sm font-semibold">68%</div>
                  </div>
                </div>
                <div className="text-sm text-[color:var(--color-muted-foreground)]">
                  <div>
                    <span className="font-semibold text-[color:var(--color-foreground)]">
                      {data.totalEnrolledCourses}
                    </span>{" "}
                    courses enrolled
                  </div>
                  <div className="mt-1">
                    Keep a daily streak to improve faster.
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/student/my-courses">View progress</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter courses</CardTitle>
              <CardDescription>Quick filters for browsing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">
                  Level
                </div>
                <div className="mt-2 space-y-2">
                  {["Beginner", "Intermediate", "Advanced"].map((l) => (
                    <label
                      key={l}
                      className="flex items-center gap-2 text-[color:var(--color-muted-foreground)]"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-indigo-600"
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <Button className="w-full">Apply filters</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
